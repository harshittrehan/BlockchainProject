pragma solidity ^0.5.0;

/* create a snart contract */
contract TodoList {
	uint public taskCount=0;
	
	struct Task{
		uint taskID;
		string taskContent;
		bool completed;

	}

	mapping(uint => Task) public tasks;

	event TaskCreated(
		uint taskID,
		string taskContent,
		bool completed

		);

	event TaskCompleted(
		uint taskID,
		bool completed
		);

	constructor() public{
		createTask("Default task!");
	}

	function createTask(string memory _content) public{
		taskCount++;
		tasks[taskCount]= Task(taskCount,_content,false);
		emit TaskCreated(taskCount,_content,false);


	}

	function toggleCompleted(uint _id) public{
		Task memory _task= tasks[_id];
		_task.completed= !_task.completed;
		tasks[_id]=_task;
		emit TaskCompleted(_id,_task.completed);
	}
}

