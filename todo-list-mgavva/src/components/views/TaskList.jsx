import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useEffect, useState } from "react";
const ACCESS_TOKEN = 'gt7ljuqzOYky8vumX47QzAz3QyOmbIE6'


export default function TaskList() {

    const [tasks, setTasks] = useState([]);
    const [inputValue, setInputValue] = useState('');

    const getTasks = async () => {
        await fetch('https://demo2.z-bit.ee/tasks', {
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`
            }
        }).then(async response => {
            const data = await response.json()
            setTasks(data)
        })
    }

    const sendTask = async (title, description) => {
        console.log(title)
        await fetch('https://demo2.z-bit.ee/tasks', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`
            },
            body: JSON.stringify({
                title: title,
                desc: description || '',
            }),
        }).then(async response => {
            console.log(await response.json())
        })
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
        getTasks();
    }, []);
    return (
        <div className="container-xl">
            <Container className='my-5'>
                <Row className='mb-3'>
                    <Col>
                        <InputGroup className="mb-3">
                            <Form.Control
                                value={inputValue}
                                onChange={(input) => setInputValue(input.target.value)}
                                placeholder="Task description"
                                aria-label="Task description"
                                aria-describedby="basic-addon2"
                            />
                            <Button type='submit' variant="outline-secondary" id="button-addon2" onClick={handleAddTask}>
                                Add
                            </Button>
                        </InputGroup>
                    </Col>
                </Row>
                {tasks.length <= 0 ? (
                    'Oops, nothing here'
                ) : (
                    tasks.map((task) => (
                        <Row xs="auto" className='mb-1' key={task.id}>
                            <Col>
                                <Form.Check
                                    type='checkbox'
                                    id={`checkbox-${task.id}`}
                                />
                            </Col>
                            <Col>
                                <p>{task.title}</p>
                            </Col>
                        </Row>
                    ))
                )}
            </Container>
        </div>
    )

}