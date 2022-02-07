import React, {useState, useEffect} from 'react';
import { Layout, Menu } from 'antd';
import { Link, withRouter } from "react-router-dom";
import "./Header.css"
import auth from "../../services/auth";

const { Header } = Layout;

const MyHeader = (props) => {
  const [currentItem, setCurrentItem] = useState([props.location.pathname]);

  useEffect(() => {
    setCurrentItem([props.location.pathname]);
  }, [props.location.key]);

  function logOut() {
    auth.logout();
    props.history.push('/login');
  }

  return (
    <Header className="header">
      <Menu theme="dark" mode="horizontal" style={{width: "100%", float: "center"}} defaultSelectedKeys={['2']} selectedKeys={currentItem}>
        <Menu.Item key="/csgo">
          <Link to={"/csgo"}>CS:GO</Link>
        </Menu.Item>
        <Menu.Item key="/dota">
          <Link to={"/dota"}>DOTA 2</Link>
        </Menu.Item>
        <Menu.Item key="/lol">
          <Link to={"/lol"}>League of Legends</Link>
        </Menu.Item>
      </Menu>
      <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['2']} style={{width: "200px"}} selectedKeys={currentItem}>
        {!auth.isAuthenticated() && (
          <>
            <Menu.Item key="/login">
              <Link to={"/login"}>Login</Link>
            </Menu.Item>
            <Menu.Item key="/register">
              <Link to={"/register"}>Register</Link>
            </Menu.Item>
          </>
        )}
        {auth.isAuthenticated() && (
            <Menu.Item  key="/logout" onClick={logOut}>
              Log Out
            </Menu.Item>
        )}
      </Menu>
    </Header>
  )
}

export default withRouter(MyHeader);
