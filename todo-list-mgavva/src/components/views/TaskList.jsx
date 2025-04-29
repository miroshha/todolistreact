import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useEffect, useState } from "react";
import Modal from 'react-bootstrap/Modal'
import '../styles/style.css';

const baseUrl = 'https://demo2.z-bit.ee';
let searchTimeout = null;
// TEST_TOKEN = gt7ljuqzOYky8vumX47QzAz3QyOmbIE6

export default function TaskList() {
    const [tasks, setTasks] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [showTokenModal, setShowTokenModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null)
    const [newTaskTitle, setNewTaskTitle] = useState('')

    let API_TOKEN = localStorage.getItem('apiToken');

    const handleCheck = async (event, task) => {
        const updatedTask = {
            ...task,
            marked_as_done: event.target.checked
        };

        await sendRequest('put', `tasks/${task.id}`, API_TOKEN, updatedTask);

        setTasks(prevTasks => prevTasks.map(t =>
            t.id === task.id ? updatedTask : t
        ));
    };

    const sendRequest = async (method, endpoint, token, body) => {
        console.log(`API_TOKEN: ${API_TOKEN}`);
        const options = {
            method: method.toUpperCase(),
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
                'Content-Type': 'application/json'
            },
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(`${baseUrl}/${endpoint}`, options);

            if (response.status === 204 || response.headers.get("Content-Length") === "0") {
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error(error);
            setShowToast(true);
        }
    };

    const getTasks = async () => {
        const data = await sendRequest('get', 'tasks', API_TOKEN);
        setTasks(data);
    };

    const sendTask = async (title) => {
        const data = await sendRequest('post', 'tasks', API_TOKEN, { title });
        return data;
    };

    const tokenEntered = async (input) => {
        const token = input.target.value;

        localStorage.setItem('apiToken', token);

        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(async () => {
            await getTasks();
        }, 750);
    };

    const removeTask = async (id) => {
        await sendRequest('delete', `tasks/${id}`, API_TOKEN);
        const newData = tasks.filter(m => m.id !== id);
        setTasks(newData);
    };

    const handleAddTask = () => {
        setTasks((prevTasks) => [
            ...prevTasks,
            {
                id: Math.random(),
                title: inputValue,
                completed: false,
            },
        ]);
        setInputValue('');
        sendTask(inputValue);
    };

    const startEditingTask = (task) => {
        setEditingTask(task);
        setNewTaskTitle(task.title)
    };

    const cancelEditing = () => {
        setEditingTask(null); 
        setNewTaskTitle('');
    };

    const saveEditedTask = async () => {
        const updatedTask = {
            ...editingTask,
            title: newTaskTitle
        };

        await sendRequest('put', `tasks/${editingTask.id}`, API_TOKEN, updatedTask);

        setTasks(prevTasks => prevTasks.map(t =>
            t.id === editingTask.id ? updatedTask : t
        ));

        setEditingTask(null);
        setNewTaskTitle('');
    };

    useEffect(() => {
        const storedToken = localStorage.getItem('apiToken');
        if (storedToken) {
            getTasks();
        } else {
            setShowTokenModal(true);
        }
    }, []);

    return (
        <div className="container-xl">
            <Modal show={showTokenModal} onHide={() => setShowTokenModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Enter API Token</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Control
                        type="password"
                        onChange={tokenEntered}
                        id="inputToken"
                        placeholder="API Token"
                        aria-label="API Token"
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowTokenModal(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={() => setShowTokenModal(false)}>
                        Submit
                    </Button>
                </Modal.Footer>
            </Modal>

            <Container className="my-5">
                <Row className="mb-5">
                    <Col>
                        <InputGroup>
                            <Form.Control
                                value={inputValue}
                                onChange={(input) => setInputValue(input.target.value)}
                                placeholder="Task description"
                                aria-label="Task description"
                            />
                            <Button
                                disabled={inputValue.trim().length === 0}
                                variant="outline-secondary"
                                onClick={handleAddTask}
                            >
                                Add
                            </Button>
                            <Button
                                variant="outline-secondary"
                                onClick={() => setShowTokenModal(true)}
                            >
                                Change API token
                            </Button>
                            <Button
                                variant="outline-secondary"
                                onClick={getTasks}
                            >
                                Refresh
                            </Button>
                        </InputGroup>
                    </Col>
                </Row>

                {!API_TOKEN ? (
                    <div>Please enter your API token to continue.</div>
                ) : tasks.message ? (
                    <div>Some error occurred: <b>{tasks.message}</b></div>
                ) : (
                    tasks.map((task) => (
                        <Row xs="auto" className="mb-1" key={task.id}>
                            <Col>
                                <Form.Check
                                    checked={task.marked_as_done}
                                    onChange={(event) => handleCheck(event, task)}
                                    type="checkbox"
                                    id={`checkbox-${task.id}`}
                                />
                            </Col>
                            <Col>
                                {editingTask && editingTask.id === task.id ? (
                                    <InputGroup>
                                        <Form.Control
                                            value={newTaskTitle}
                                            onChange={(e) => setNewTaskTitle(e.target.value)}
                                            placeholder="Edit task"
                                        />
                                        <Button variant="primary" onClick={saveEditedTask}>
                                            Save
                                        </Button>
                                        <Button variant="secondary" onClick={cancelEditing}>
                                            Cancel
                                        </Button>
                                    </InputGroup>
                                ) : (
                                    <>                                    
                                        <p className="list-item" onClick={() => startEditingTask(task)}>
                                            {task.title}
                                        </p>
                                        <p onClick={() => removeTask(task)}>🗑️</p>
                                    </>
                                )}
                            </Col>
                        </Row>
                    ))
                )}
            </Container>
        </div>
    );
}
