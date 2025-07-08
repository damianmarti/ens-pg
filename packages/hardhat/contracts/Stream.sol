// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract Stream is AccessControl {
	bytes32 public constant OWNER_ROLE = keccak256("OWNER_ROLE");

	struct GrantStream {
		uint256 cap;
		uint256 last;
		uint256 amountLeft;
		uint8 grantNumber;
		uint8 stageNumber;
		address builder;
	}

	struct BuilderGrantData {
		uint256 grantId;
		uint8 grantNumber;
	}

	mapping(uint256 => GrantStream) public grantStreams;
	uint256 public nextGrantId = 1;

	mapping(address => BuilderGrantData[]) public builderGrants;

	uint256 public constant FULL_STREAM_UNLOCK_PERIOD = 60; // 60 seconds
	uint256 public constant DUST_THRESHOLD = 1000000000000000; // 0.001 ETH

	event Withdraw(
		address indexed to,
		uint256 amount,
		string reason,
		uint256 grantId,
		uint8 grantNumber,
		uint8 stageNumber
	);
	event AddGrant(uint256 indexed grantId, address indexed to, uint256 amount);
	event ReinitializeGrant(
		uint256 indexed grantId,
		address indexed to,
		uint256 amount
	);
	event MoveGrantToNextStage(
		uint256 indexed grantId,
		address indexed to,
		uint256 amount,
		uint8 grantNumber,
		uint8 stageNumber
	);
	event ReinitializeNextStage(
		uint256 indexed grantId,
		address indexed builder,
		uint256 amount,
		uint8 grantNumber,
		uint8 stageNumber
	);
	event UpdateGrant(
		uint256 indexed grantId,
		address indexed to,
		uint256 cap,
		uint256 last,
		uint256 amountLeft,
		uint8 grantNumber,
		uint8 stageNumber
	);
	event AddOwner(address indexed newOwner, address indexed addedBy);
	event RemoveOwner(address indexed removedOwner, address indexed removedBy);

	// Custom errors
	error NoActiveStream();
	error InsufficientContractFunds();
	error UnauthorizedWithdrawal();
	error InsufficientStreamFunds();
	error FailedToSendEther();
	error PreviousAmountNotFullyWithdrawn();
	error AlreadyWithdrawnFromGrant();

	constructor(address[] memory _initialOwners) {
		_setRoleAdmin(OWNER_ROLE, OWNER_ROLE);
		for (uint i = 0; i < _initialOwners.length; i++) {
			_grantRole(OWNER_ROLE, _initialOwners[i]);
		}
	}

	function unlockedGrantAmount(
		uint256 _grantId
	) public view returns (uint256) {
		GrantStream memory grantStream = grantStreams[_grantId];
		if (grantStream.cap == 0) revert NoActiveStream();

		if (grantStream.amountLeft == 0) {
			return 0;
		}

		uint256 elapsedTime = block.timestamp - grantStream.last;
		uint256 unlockedAmount = (grantStream.cap * elapsedTime) /
			FULL_STREAM_UNLOCK_PERIOD;

		return
			unlockedAmount > grantStream.amountLeft
				? grantStream.amountLeft
				: unlockedAmount;
	}

	function addGrantStream(
		address _builder,
		uint256 _cap,
		uint8 _grantNumber
	) public onlyRole(OWNER_ROLE) returns (uint256) {
		// check if grantStream with same grantNumber already exists
		uint256 existingGrantId;
		BuilderGrantData[] memory existingBuilderGrants = builderGrants[
			_builder
		];
		for (uint i = 0; i < existingBuilderGrants.length; i++) {
			GrantStream memory existingGrant = grantStreams[
				existingBuilderGrants[i].grantId
			];
			if (existingGrant.grantNumber == _grantNumber) {
				if (existingGrant.cap != existingGrant.amountLeft) {
					revert AlreadyWithdrawnFromGrant();
				}
				existingGrantId = existingBuilderGrants[i].grantId;
				break;
			}
		}

		// update existing grant or create new one
		uint256 grantId = existingGrantId != 0
			? existingGrantId
			: nextGrantId++;

		grantStreams[grantId] = GrantStream({
			cap: _cap,
			last: block.timestamp,
			amountLeft: _cap,
			grantNumber: _grantNumber,
			stageNumber: 1,
			builder: _builder
		});

		if (existingGrantId == 0) {
			builderGrants[_builder].push(
				BuilderGrantData({
					grantId: grantId,
					grantNumber: _grantNumber
				})
			);
			emit AddGrant(grantId, _builder, _cap);
		} else {
			emit ReinitializeGrant(grantId, _builder, _cap);
		}
		return grantId;
	}

	function moveGrantToNextStage(
		uint256 _grantId,
		uint256 _cap
	) public onlyRole(OWNER_ROLE) {
		GrantStream storage grantStream = grantStreams[_grantId];
		if (grantStream.cap == 0) revert NoActiveStream();

		// If amountLeft equals cap, reinitialize with same stage number
		if (grantStream.amountLeft == grantStream.cap) {
			grantStream.cap = _cap;
			grantStream.last = block.timestamp;
			grantStream.amountLeft = _cap;
			// Stage number remains the same
			emit ReinitializeNextStage(
				_grantId,
				grantStream.builder,
				_cap,
				grantStream.grantNumber,
				grantStream.stageNumber
			);
		} else {
			if (grantStream.amountLeft > DUST_THRESHOLD)
				revert PreviousAmountNotFullyWithdrawn();

			if (grantStream.amountLeft > 0) {
				(bool sent, ) = payable(grantStream.builder).call{
					value: grantStream.amountLeft
				}("");
				if (!sent) revert FailedToSendEther();
			}

			grantStream.cap = _cap;
			grantStream.last = block.timestamp;
			grantStream.amountLeft = _cap;
			grantStream.stageNumber += 1;

			emit MoveGrantToNextStage(
				_grantId,
				grantStream.builder,
				_cap,
				grantStream.grantNumber,
				grantStream.stageNumber
			);
		}
	}

	function updateGrant(
		uint256 _grantId,
		uint256 _cap,
		uint256 _last,
		uint256 _amountLeft,
		uint8 _stageNumber
	) public onlyRole(OWNER_ROLE) {
		GrantStream storage grantStream = grantStreams[_grantId];
		if (grantStream.cap == 0) revert NoActiveStream();
		grantStream.cap = _cap;
		grantStream.last = _last;
		grantStream.amountLeft = _amountLeft;
		grantStream.stageNumber = _stageNumber;

		emit UpdateGrant(
			_grantId,
			grantStream.builder,
			_cap,
			grantStream.last,
			grantStream.amountLeft,
			grantStream.grantNumber,
			grantStream.stageNumber
		);
	}

	function streamWithdraw(
		uint256 _grantId,
		uint256 _amount,
		string memory _reason
	) public {
		if (address(this).balance < _amount) revert InsufficientContractFunds();
		GrantStream storage grantStream = grantStreams[_grantId];
		if (grantStream.cap == 0) revert NoActiveStream();
		if (msg.sender != grantStream.builder) revert UnauthorizedWithdrawal();

		uint256 totalAmountCanWithdraw = unlockedGrantAmount(_grantId);
		if (totalAmountCanWithdraw < _amount) revert InsufficientStreamFunds();

		uint256 elapsedTime = block.timestamp - grantStream.last;
		uint256 timeToDeduct = (elapsedTime * _amount) / totalAmountCanWithdraw;

		grantStream.last = grantStream.last + timeToDeduct;
		grantStream.amountLeft -= _amount;

		(bool sent, ) = msg.sender.call{ value: _amount }("");
		if (!sent) revert FailedToSendEther();

		emit Withdraw(
			msg.sender,
			_amount,
			_reason,
			_grantId,
			grantStream.grantNumber,
			grantStream.stageNumber
		);
	}

	function getBuilderGrantCount(
		address _builder
	) public view returns (uint256) {
		return builderGrants[_builder].length;
	}

	function addOwner(address newOwner) public onlyRole(OWNER_ROLE) {
		grantRole(OWNER_ROLE, newOwner);
		emit AddOwner(newOwner, msg.sender);
	}

	function removeOwner(address owner) public onlyRole(OWNER_ROLE) {
		revokeRole(OWNER_ROLE, owner);
		emit RemoveOwner(owner, msg.sender);
	}

	function getGrantIdByBuilderAndGrantNumber(
		address _builder,
		uint8 _grantNumber
	) public view returns (uint256) {
		for (uint256 i = 0; i < builderGrants[_builder].length; i++) {
			if (builderGrants[_builder][i].grantNumber == _grantNumber) {
				return builderGrants[_builder][i].grantId;
			}
		}
		return 0;
	}

	receive() external payable {}

	fallback() external payable {}
}
