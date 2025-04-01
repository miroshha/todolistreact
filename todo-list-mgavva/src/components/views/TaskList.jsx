import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useEffect, useState } from "react";
import '../styles/style.css'
const baseUrl = 'https://demo2.z-bit.ee'
let searchTimeout = null;

export default function TaskList() {

    const [tasks, setTasks] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [API_TOKEN, setToken] = useState('');
    const [showToast, setShowToast] = useState(false);

    const handleCheck = async (event, task) => {
        const updatedTask = {
            ...task,
            marked_as_done: event.target.checked
        };

        await sendRequest('put', `tasks/${task.id}`, updatedTask);

        setTasks(prevTasks => prevTasks.map(t =>
            t.id === task.id ? updatedTask : t
        ));
    }
    const sendRequest = async (method, endpoint, body) => {
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
            console.error(error)
            setShowToast(true);
        }

    }

    const getTasks = async () => {
        const data = await sendRequest('get', 'tasks');
        setTasks(data);
    }

    const sendTask = async (title, description) => {
        const data = await sendRequest('post', 'tasks', {
            title: title,
            description: description || '',
        })
        return data
    }

    const tokenEntered = async (input) => {
        setToken(input.target.value)
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(async () => {
            await getTasks();
        }, 750);
    }

    const removeTask = async (id, index) => {
        console.log(id, index)
        await sendRequest('delete', `tasks/${id}`)
        const newData = tasks.filter(m => m.id !== id)
        setTasks(newData)
    }

    const handleAddTask = () => {
        setTasks((prevTasks) => [
            ...prevTasks,
            {
                id: Math.random(),
                title: inputValue,
                completed: false,
            },
        ]);
        setInputValue('')
        sendTask(inputValue, '')
    };
    useEffect(() => {
        if (API_TOKEN) {
            getTasks();
        }
    }, []);
    return (
        <div className="container-xl">
            <Container className='my-5'>
                <Row className='mb-5'>
                    <Col>
                        <Form.Control
                            type="password"
                            onChange={(input) => tokenEntered(input)}
                            id="inputToken"
                            placeholder="API Token"
                            aria-label="API Token"
                            aria-describedby="basic-addon3"
                        />
                    </Col>
                    <Col >
                        <InputGroup>
                            <Form.Control
                                value={inputValue}
                                onChange={(input) => setInputValue(input.target.value)}
                                placeholder="Task description"
                                aria-label="Task description"
                                aria-describedby="basic-addon2"
                            />
                            <Button disabled={inputValue.trim().length === 0} type='submit' variant="outline-secondary" id="button-addon2" onClick={handleAddTask}>
                                Add
                            </Button>
                        </InputGroup>
                    </Col>
                </Row>
                {
                !API_TOKEN ? (
                    'Enter API token'
                ) : tasks.length <= 0 ? (
                    'Oops, nothing here'
                ) : (
                    tasks.map((task, index) => (

                        <Row xs="auto" className='mb-1' key={task.id}>
                            <Col>
                                <Form.Check
                                    checked={task.marked_as_done}
                                    onChange={(event) => handleCheck(event, task)}
                                    type='checkbox'
                                    id={`checkbox-${task.id}`}
                                />
                            </Col>
                            <Col>
                                <p className='list-item' onClick={() => removeTask(task.id, task)}>{task.title}</p>
                            </Col>
                        </Row>
                    ))
                )}
            </Container>
        </div>
    )

}