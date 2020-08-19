/**
 * Created by eliwinkelman on 8/17/20.
 */


import React, {useState} from "react";
import {updateNetworkPermissions} from "../api";
import { useAuth0 } from "../react-auth0-wrapper";
import { Form, ListGroup, Button, Modal } from 'react-bootstrap'
import '../App.css'
import UserSearch from './UserSearch.js';

const AddUserPermissionsModal = (props) => {
    const {getTokenSilently} = useAuth0();

    const [show, setShow] = useState(false);
    const [userPermissions, setUserPermissions] = useState(props.userPermissions);
    const [userInfo, setUserInfo] = useState(props.userInfo);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const onSelectUser = (user) => {
        if (!userPermissions.hasOwnProperty(user._id)){
            setUserPermissions({
                ...userPermissions,
                [user._id]: []
            });

            setUserInfo({
                ...userInfo,
                [user._id]: user
            });
        }
    };

    const updatePermissionsLocally = (userId, permission, add) => {
        if (add) {
            // this permission
            setUserPermissions( {
                ...userPermissions,
                [userId]: userPermissions[userId].concat(permission)
            })
        }
        else {
            // remove
            setUserPermissions( {
                ...userPermissions,
                [userId]: userPermissions[userId].filter((el) => {
                    return el !== permission})
            });
        }
    };

    return (
        <>
          <Button variant="primary" size="sm" onClick={handleShow}>
            Share
          </Button>

          <Modal show={show} centered backdrop="static" onHide={handleClose} animation={false}>
            <Modal.Header closeButton>
              <Modal.Title>Share</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <AddUserPermissions updatePermissions={updatePermissionsLocally} owner={props.owner} onSelectUser={onSelectUser} userInfo={userInfo} userPermissions={userPermissions}/>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                Close
              </Button>
              <Button variant="primary" onClick={async () => {handleClose(); await updateNetworkPermissions(props.network_id, userPermissions, getTokenSilently, (response) => {console.log(response)})}}>
                Save Changes
              </Button>
            </Modal.Footer>
          </Modal>
        </>
    )

};

const AddUserPermissions = (props) => {

    return (
        <>
            <div className="user-permissions">
                <ListGroup variant="flush">
                {Object.entries(props.userPermissions).map(([key, value]) => {

                    return (

                        <ListGroup.Item key={key}>
                            <UserPermission owner={key === props.owner} userId={key} updatePermissions={props.updatePermissions} userInfo={props.userInfo[key]} permissions={value}/>
                        </ListGroup.Item>
                    )}
                )}
                </ListGroup>
            </div>
            <UserSearch onSelectUser={props.onSelectUser} />
        </>)
};

const UserPermission = (props) => {
    console.log(props.permissions);
    return (
        <div className="user-permission">
            <div style={{display: 'inline-block', width: 'fit-content'}}>
            <b>{props.userInfo.username}</b>
            <br />
            {props.userInfo.email}
            <Form>
                <Form.Group>
                    <Form.Check inline onChange={(e) => props.updatePermissions(props.userId, 'view', e.target.checked)} disabled={props.owner} checked={props.permissions.includes('view')} type="checkbox" label="View"/>
                    <Form.Check inline onChange={(e) => props.updatePermissions(props.userId, 'edit', e.target.checked)} disabled={props.owner} checked={props.permissions.includes('edit')} type="checkbox" label="Edit"/>
                </Form.Group>
            </Form>
            </div>
            <div style={{float: 'right'}}>{props.owner ? <p>Owner</p> : null }</div>
        </div>
    )
};

export default AddUserPermissionsModal