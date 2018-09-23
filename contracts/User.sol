pragma solidity ^0.4.23;


import "openzeppelin-zos/contracts/ownership/Ownable.sol";

/**
 * @title User v1.0
 */
contract User is Ownable {
    bytes32 public id;
    bytes32 public pka;
    bytes32 public pkb;

    /**
     * @dev Contract constructor instantiates user with owner
     */
    function initialize(bytes32 _id, bytes32 _pka, bytes32 _pkb, address _owner) isInitializer("User", "0.0.1") public {
        id = _id;
        pka = _pka;
        pkb = _pkb;
        Ownable.initialize(_owner);
    }

    /**
     * @dev Changes ownership of user to another address (for private networks)
     */
    function changePK(bytes32 _pka, bytes32 _pkb) public onlyOwner {
        pka = _pka;
        pkb = _pkb;
    }

    /**
     * @dev Delete identity from the Blockchain
     */
    function remove() public onlyOwner {
        selfdestruct(msg.sender);
    }

    /**
     * @dev Get public key
     */
    function getPK() public view returns (bytes32, bytes32) {
        return (pka, pkb);
    }
}
