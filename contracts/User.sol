pragma solidity ^0.4.23;


import "openzeppelin-zos/contracts/ownership/Ownable.sol";

/**
 * @title User v1.0
 */
contract User is Ownable {
    bytes32 public id;
    bytes32 public pk;

    /**
     * @dev Contract constructor instantiates user with owner
     */
    function initialize(bytes32 _id, bytes32 _pk, address _owner) isInitializer("User", "0.0.1") public {
        id = _id;
        pk = _pk;
        Ownable.initialize(_owner);
    }

    /**
     * @dev Changes ownership of user to another address (for private networks)
     */
    function changePK(bytes32 _pk) public onlyOwner {
        pk = _pk;
    }

    /**
     * @dev Delete identity from the Blockchain
     */
    function remove() public onlyOwner {
        selfdestruct(msg.sender);
    }
}
