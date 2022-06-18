import React, { Component  } from 'react';
import {  StyleSheet, Text, ToastAndroid, AsyncStorage } from 'react-native';
import { Container, Content, Body, Button, Icon } from 'native-base';
import Expo from 'expo';
var googleLogin = require("../utils/googleLoginUtils");

export default class loginGoogleButton extends Component{

    constructor(props) {
        super(props);
        this.state = {
            showToast: false
        }
    }

    render() {
        return (
                <Button iconLeft style={styles.buttonLogin} onPress= {async () => {
                    let result = await googleLogin.signInWithGoogleAsync();
                    if(!result){
                        ToastAndroid.show('Wrong Domain use unitn domain!' , ToastAndroid.SHORT);
                    }else{
                        await AsyncStorage.setItem('username' , result.name.split(" ")[0]);
                        await AsyncStorage.setItem('email', result.email);
                        await AsyncStorage.setItem('id', result.id);
                        const value = await AsyncStorage.getItem('department');
                        //console.log(result.email);
                        if(value !== null){
                            this.props.navigation.navigate('home');
                        }else{
                            this.props.navigation.navigate('SelectDepartment');
                        }
                    }
                }} >
                    <Icon name='logo-google'/>
                    <Text style={{color: 'white', fontSize: 18, left:'40%', width: '100%',}}>Login with Google </Text>
                </Button>
        );
    }
}



const styles = StyleSheet.create({
        buttonLogin: {
            left : '20%',
            backgroundColor: '#FF2500',
            width: '60%',
        }
    });