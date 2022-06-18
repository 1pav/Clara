import React, {Component} from 'react';
import {NavigationActions} from 'react-navigation';
import {StyleSheet, ScrollView, Text, View, ToastAndroid, AsyncStorage} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import FreeRoomsScreen from './FreeRoomsScreen';
import SelectDepartmentScreen from './SelectDepartmentScreen';
var googleLogin = require("../utils/googleLoginUtils");

export default class SideMenuScreen extends Component {
	navigateToScreen = (route) => () => {
		const navigateAction = NavigationActions.navigate({
			routeName: route
		});
		this.props.navigation.dispatch(navigateAction);
	}

	constructor(props) {
	    super(props);
	    this.state = {
	      username: undefined,
	      dep: undefined
	    }; 
	    this.checkLogin();
	}

	async componentWillUpdate(){
		const department = await AsyncStorage.getItem('department');
		this.setState({
			dep: department.charAt(0).toUpperCase() + department.slice(1)
		});
	}

	async checkLogin(){
		var username = null;
		try {
	      username = await AsyncStorage.getItem('username');
	      const dep = await AsyncStorage.getItem('department');
	      if (username !== null){
	        this.setState({
	          username: username,
	          dep: dep
	        });
	      }else{
	      	this.setState({
	          username: undefined,
	          dep: dep
	        });
	      }
	    } catch (error) {
	      console.log(error);
	    }
	    return username;
	}

	render () {
		let access = "Login";
		if (this.state.username !== undefined){
			//console.log(username);
	        access = "Logout - " + this.state.username;
	      }

		return (
			<View style={styles.container}>
				<View style={styles.headerContainer}>
					<Icon name="institution" size={40} color='white'/>
					<Text style={styles.headerText}>{this.state.dep}</Text>
				</View>
				<ScrollView>
					<View>
						<View style={styles.navSectionStyle}>
							<Icon name="home" size={30}/>
							<Text style={styles.navItemStyle} onPress={this.navigateToScreen('SelectDepartment')}>
								Change Department
							</Text>
						</View>
						<View style={styles.navSectionStyle}>
							<Icon name="warning" size={30}/>
							<Text style={styles.navItemStyle} onPress={this.navigateToScreen('IssueScreen')}>
								Issue
							</Text>
						</View>
					</View>
				</ScrollView>
				<View>
					<View style={styles.navSectionStyle}>
						<Icon name="envelope" size={30}/>
						<Text style={styles.navItemStyle} onPress={this.navigateToScreen('ContactUs')}>
							Contact Us
						</Text>
					</View>
					<View style={styles.navSectionStyle}>
						<Icon name="user" size={30}/>
						<Text style={styles.navItemStyle} onPress={async () => {
							if(this.state.username !== undefined){
								await AsyncStorage.removeItem('username');
								this.navigateToScreen('FreeRooms');
							}else{
								let result = await googleLogin.signInWithGoogleAsync();
			                    if(!result){
			                        ToastAndroid.show('Wrong Domain use unitn domain!', ToastAndroid.SHORT);
			                    }else{
			                    	await AsyncStorage.setItem('username' , result.name.split(" ")[0]);
                                    await AsyncStorage.setItem('email', result.email);
                                    await AsyncStorage.setItem('id', result.id);
			                        //console.log(result.email);
			                        this.props.navigation.navigate('home');
			                    }
							}
							this.checkLogin();
						}}>
							{access}
						</Text>
					</View>
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1
	},
	navItemStyle: {
		padding: 10,		
		fontSize:20,
	},
	navSectionStyle: {
		paddingLeft:10,
		flexDirection: 'row',
		alignItems:'center',
	},
	headerContainer: {
		flexDirection:'row',
		padding: 70,
		paddingLeft: 10,
		paddingTop: 20,
		backgroundColor: '#009688',
		alignItems:'center'
	},
	headerText: {
		paddingLeft:30,
		fontSize:20,
		color:'white',
	},
});
