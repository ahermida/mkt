pragma solidity ^0.4.23;

import "openzeppelin-zos/contracts/ownership/Ownable.sol";
import "./User.sol";

/**
 * @title Mkt is a tool for Self Sovereign Social Networking
 */
contract Mkt is Ownable {

    // Accounts indexed into structs
    struct Account {
        address user;
        address owner;
    }

    // Registry of all users
    mapping (bytes32 => Account) public register;

    // Logs Withdrawals and User Creations
    event Withdrawal(address indexed wallet, uint256 value);
    event CreateUser(bytes32 indexed id, address indexed user);

    /**
     * @dev Constructor in zOS
     * Creates and stores a reference to the user register
     */
    function initialize(address _admin) isInitializer("Mkt", "0.0.1") public {
        Ownable.initialize(_admin);
    }

    /**
     * @dev Insert a new user into the user registry, owned by sender
     */
    function newUser(bytes32 _id, bytes32 _pka, bytes32 _pkb) public payable returns (address) {
        // require(msg.value > 5 finney);
        User user = new User();
        user.initialize(_id, _pka, _pkb, msg.sender);
        insert(_id, address(user), msg.sender);
        emit CreateUser(_id, address(user));
        return address(user);
    }

    /**
     * @dev Transfer funds from contract to owner's wallet
     */
    function withdraw(address _wallet) public onlyOwner {
        require(address(this).balance > 0);
        require(_wallet != address(0));
        uint256 value = address(this).balance;
        _wallet.transfer(value);
        emit Withdrawal(_wallet, value);
    }

    /**
     * @dev Insert a new user into the registry
     */
    function insert(bytes32 handle, address user, address owner) public {
        require(!contains(handle));
        require(user != address(0));
        require(owner != address(0));
        register[handle] = Account(user, owner);
    }

    /**
     * @dev Update the user that the hande points to
     */
    function update(bytes32 handle, address user) public {
        require(contains(handle));
        require(user != address(0));
        require(msg.sender == register[handle].owner);
        register[handle].user = user;
    }

    /**
     * @dev Transfer a new user into the registry
     */
    function transfer(bytes32 handle, address owner) public {
        require(contains(handle));
        require(owner != address(0));
        require(msg.sender == register[handle].owner);
        register[handle].owner = owner;
    }

    /**
     * @dev Remove a new user from the registry
     */
    function remove(bytes32 handle) public {
        require(contains(handle));
        require(msg.sender == register[handle].owner);
        delete register[handle];
    }

    /**
     * @dev Get user contract address from the registry
     */
    function getUser(bytes32 handle) public view returns (address) {
        require(contains(handle));
        return register[handle].user;
    }

    /**
     * @dev Get owner of a particular handle
     */
    function getOwner(bytes32 handle) public view returns (address) {
        require(contains(handle));
        return register[handle].owner;
    }

    /**
     * @dev Get public key for a particular handle
     */
    function getKey(bytes32 handle) public view returns (bytes32, bytes32) {
        require(contains(handle));
        User user = User(register[handle].user);
        return (user.getPK());
    }

    /**
     * @dev Check if user is in registry
     */
    function contains(bytes32 handle) public view returns (bool) {
        return register[handle].user != 0;
    }
}
