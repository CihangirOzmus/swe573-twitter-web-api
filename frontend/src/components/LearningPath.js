import React, { Component } from 'react';
import { Col, ListGroup, Tab, Button } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Link } from "react-router-dom";
import {faChevronRight, faTrash, faEdit, faPlayCircle, faCheck} from '@fortawesome/free-solid-svg-icons'
import QuestionModal from "./QuestionModal";
import OptionModal from "./OptionModal";
import {ACCESS_TOKEN, API_BASE_URL} from "../util";
import axios from "axios";
import toast from "toasted-notes";

export class PathNavigator extends Component {
    render() {
        const contentList = this.props.contents;
        return (
            <Col sm={3}>
                <ListGroup>
                    {contentList.map((content, contentId) => {
                        return (
                            <ListGroup.Item key={contentId} action eventKey={content.id}>
                                {contentId + 1} - {content.title} <FontAwesomeIcon icon={faChevronRight} />
                            </ListGroup.Item>
                        )
                    })}
                </ListGroup>
            </Col>
        )
    }
}

export class PathTabs extends Component {
    render() {
        const { contents, editable, handleRefresh } = this.props;
        return (
            <Col sm={9}>
                <Tab.Content>
                    {contents.map((content, contentId) => {
                        return (
                            <Tab.Pane key={contentId} eventKey={content.id}>
                                <PathElement
                                    content={content}
                                    questions={content.questionList}
                                    editable={editable}
                                    handleRefresh={handleRefresh}
                                />
                            </Tab.Pane>
                        )
                    })}
                </Tab.Content>
            </Col>
        )
    }
}

export class PathElement extends Component {

    handleDeleteContentById(contentId) {
        const url = API_BASE_URL + `/contents/${contentId}`;

        const REQUEST_HEADERS = {
            headers: { 'content-type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem(ACCESS_TOKEN) }
        };

        axios.delete(url, REQUEST_HEADERS)
            .then(res => {
                toast.notify("Content deleted successfully.", { position: "bottom-right" });
                this.props.handleRefresh()
            }).catch(err => {
                console.log(err)
            });
    }

    render() {
        const { content, questions, editable, handleRefresh } = this.props;
        return (
            <div className=" bg-alt materialBody">
                {editable && (
                    <div className="text-center text-white border bg-info rounded-pill">
                        <h1>Content Creation</h1>
                    </div>
                )}
                <h1 className="mt-4 mb-4 fontMedium">
                    {content.title}
                    {editable && (
                        <React.Fragment>
                            <QuestionModal handleRefresh={() => handleRefresh()} contentId={content.id} />
                            <Button className="ml-2 btn-sm inlineBtn" variant="outline-danger" onClick={() => this.handleDeleteContentById(content.id)}><FontAwesomeIcon icon={faTrash} /></Button>
                            <Link className="btn  btn-outline-primary btn-sm ml-2 inlineBtn" to={`/content/${content.id}`}><FontAwesomeIcon icon={faEdit} /></Link>
                        </React.Fragment>
                    )}
                </h1>
                <div className="text-left" dangerouslySetInnerHTML={{ __html: content.text }} ></div>

                {
                    questions.length > 0 && !editable && (
                        <React.Fragment>
                            <hr/>
                            <Link className="btn btn-outline-info btn-lg ml-2 inlineBtn" to={`/quiz/${content.id}`}><FontAwesomeIcon icon={faPlayCircle} /> Start Quiz</Link>
                        </React.Fragment>
                    )
                }

                {
                    questions.length > 0 && editable && (
                        <React.Fragment>
                            <hr />
                            {
                                questions.map((question, idx) => {
                                    return (
                                        <Question
                                            key={idx}
                                            order={idx + 1}
                                            question={question}
                                            editable={editable}
                                            handleRefresh={handleRefresh}
                                            answered={false}
                                        />
                                    )
                                })
                            }
                        </React.Fragment>
                    )
                }
            </div>
        )
    }
}

export class Question extends Component {
    constructor(props) {
        super(props);
        this.state = {
            disabled: false
        };
    }

    componentDidMount() {
        this.setState({
            disabled: this.props.answered
        })
    }

    handleDeleteQuestionById(questionIdToDelete) {
        const url = API_BASE_URL + `/questions/${questionIdToDelete}`;

        const REQUEST_HEADERS = {
            headers: { 'content-type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem(ACCESS_TOKEN) }
        };

        axios.delete(url, REQUEST_HEADERS)
            .then(res => {
                toast.notify("Question deleted successfully.", { position: "bottom-right" });
                this.props.handleRefresh()
            }).catch(err => {
                console.log(err)
            });
    }

    render() {
        const { question, order, editable, handleRefresh } = this.props;
        const { disabled } = this.state;
        return (
            <React.Fragment>
                {editable && (
                    <div className="text-center text-white border bg-info rounded-pill">
                        <h1>Quiz Creation</h1>
                    </div>
                )}
                <div className="mt-5" id={`questionDiv${question.id}`}>
                    <p>
                        <strong>Q{order}:</strong> {question.text}
                        {editable && (
                            <React.Fragment>
                                <OptionModal handleRefresh={() => handleRefresh()} questionId={question.id} />
                                <Button
                                    className="ml-2 btn-sm inlineBtn"
                                    variant="outline-danger"
                                    onClick={() => this.handleDeleteQuestionById(question.id)}>
                                    <FontAwesomeIcon icon={faTrash} />
                                </Button>
                            </React.Fragment>
                        )}
                    </p>
                    {
                        question.choiceList.length > 0 && (

                            <Formik
                                initialValues={{ choice: '' }}
                                validate={values => {
                                    let errors = {};
                                    if (!values.choice) {
                                        errors.choice = 'You must select a choice';
                                    }
                                    return errors;
                                }}
                                onSubmit={(values, { setSubmitting }) => {
                                    setTimeout(() => {
                                        const selectedOption = {
                                            choice: values.choice,
                                            question: question.id
                                        };
                                        this.setState({ disabled: true });
                                        console.log(selectedOption);
                                        // to give answer post the newOption
                                        /* createOption(selectedOption)
                                            .then(res => {
                                                toast.notify("Question answered.", { position: "bottom-right" });

                                            }).catch(err => {
                                                toast.notify("Something went wrong!", { position: "bottom-right" });
                                            }); */
                                        setSubmitting(false);
                                    }, 400);
                                }}
                            >
                                {() => (
                                    <Form>
                                        <ul className={!editable ? 'questionUl' : ''}>
                                            {
                                                question.choiceList.map((choice, choiceId) => {
                                                    return (
                                                        <li key={choiceId} className="m-2">
                                                            {!editable &&
                                                                <Field
                                                                    type="radio"
                                                                    name="choice"
                                                                    className="choices"
                                                                    disabled={disabled}
                                                                    value={choice.id}
                                                                />
                                                            } {choice.text}
                                                            {editable && (
                                                                <span>
                                                                    {choice.isCorrect && <FontAwesomeIcon className="text-success" icon={faCheck} />}
                                                                </span>
                                                            )}
                                                        </li>
                                                    )
                                                })
                                            }
                                            <ErrorMessage name="choice" className="errorMessage" component="span" />

                                            {!editable && (
                                                <div className="mt-3 text-left">
                                                    <Button
                                                        className="ml-2 btn inlineBtn"
                                                        variant="info"
                                                        type="submit"
                                                        disabled={disabled}
                                                        id={`question${question.id}`} >
                                                        {disabled ? 'Answered' : 'Give Answer'}
                                                    </Button>
                                                </div>
                                            )}

                                        </ul>

                                    </Form>
                                )}
                            </Formik>
                        )
                    }
                    <hr />
                </div>
            </React.Fragment>

        )
    }
}