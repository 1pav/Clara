import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {StyleSheet, ScrollView, AsyncStorage, TextInput} from 'react-native';
import { Container, Content, Text, List, ListItem, Body, Spinner, Button, Form} from 'native-base';
import { Col, Row, Grid } from "react-native-easy-grid";
import Modal from 'react-native-modal';

export default class RoomScreen extends Component {

	constructor(props) {
		super(props);
		this.state = {
			username:undefined,
			selectedDep:undefined,
			selectedRoom: undefined,
			selectedDate: undefined,
			issues: undefined,
			dataSource: undefined,
			roomLoading: true,
			issueLoading:true,
			isModalVisible: false,
			text: '',
		}
		this.loadRoomInfo();
	}

	_showModal = () => this.setState({ isModalVisible: true })

	_hideModal = () => this.setState({ isModalVisible: false })

	async loadRoomInfo() {
		let dep = await this.loadDepartment();
		let room = await this.loadRoom();
		let date = await this.loadDate();
		this.checkLogin();
		this.loadIssues();
		this.setState({
				selectedRoom: room,
				selectedDate: date,
				selectedDep: dep
		});
		var url = 'https://clara-unitn.herokuapp.com/departments/' + dep + '/' + room + '?date=' + date.replace(new RegExp('/', 'g'), '-');
		return fetch(url).then((response) => response.json()).then((responseJson) => {
			this.setState({
				roomLoading: false,
				dataSource: responseJson
			});
		})
		.catch((error) => {
			console.error(error);
		});
	}

	async loadIssues() {
		var url = 'https://clara-unitn.herokuapp.com/issues';
		return fetch(url).then((response) => response.json()).then((responseJson) => {
			this.setState({
				issueLoading: false,
				issues: responseJson
			});
		})
		.catch((error) => {
			console.error(error);
		});
	}

	async loadDepartment() {
		try {
			const value = await AsyncStorage.getItem('department');
			return value;
		} catch (error) {
			console.log(error);
		};
	}

	async loadRoom() {
		try {
				const value = await AsyncStorage.getItem('selectedRoom');
				return value;
		} catch (error) {
				console.log(error);
		};
	}

	async loadDate() {
		try {
				const value = await AsyncStorage.getItem('selectedDate');
				return value;
		} catch (error) {
				console.log(error);
		};
	}

	async checkLogin(){
		var username = null;
		try {
			username = await AsyncStorage.getItem('username');
			if (username !== null){
			this.setState({
				username: username
			});
			}else{
			 this.setState({
				username: undefined
			});
		 }
		} catch (error) {
			console.log(error);
		}
		return username;
	}

	async sendIssue(){
		var claraUrl = 'https://clara-unitn.herokuapp.com/issues';
		var id;
		if(this.state.text !== ''){
			try {
				id = await AsyncStorage.getItem('id');
			} catch (error) {
				console.log(error);
			};
			fetch(claraUrl, {
				method: "POST",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					loginId: id,
					deptName: this.state.selectedDep,
					roomName: this.state.selectedRoom,
					type: '',
					description: this.state.text
				})
			}).then(() => {	
				this.setState({ 
					isModalVisible: false,
					issueLoading: false,
					text: ''
				});
				this.loadIssues();
			});
		}
	}


	render() {

		const { navigation } = this.props.navigation;

		if (this.state.roomLoading || this.state.issueLoading) {
			return (
				<Body>
					<Spinner color='#009688' />
				</Body>
			);
		}

		var seats = ( 
			<Row>
				<Col>
					<Row><Text>Seats</Text></Row>
					<Row><Text style={styles.optionText}>{this.state.dataSource['seats']}</Text></Row>
				</Col>
				<Col><Icon name="event-seat" size={30} style={styles.icon}/></Col>
			</Row>
		);
		var socket;
		if(this.state.dataSource['electricalSockets']){
			socket = (
				<Row>
					<Col>
						<Row><Text>Electrical socket</Text></Row>
						<Row><Text style={styles.optionText}>Yes</Text></Row>
					</Col>
					<Col><Icon name="power" size={30} style={styles.icon}/></Col>
				</Row>
			);
		}
		else{
			socket = (
				<Row>
					<Col>
						<Row><Text>Electrical socket</Text></Row>
						<Row><Text style={styles.optionText}>No</Text></Row>
					</Col>
					<Col><Icon name="power" size={30} style={styles.icon}/></Col>
				</Row>
			);
		}

		var timetable = [];

		if (this.state.dataSource['slots'].length == 0) {
			timetable.push(
				<ListItem key = '0'>
					<Col>
						<Row><Text>No Activity today</Text></Row>
					</Col>
				</ListItem>
			);
		}
		else{
			var times = Object.keys(this.state.dataSource['slots'])
			for(let i = 0; i < times.length; i++){
				var hour = times[i];
				var lesson = this.state.dataSource['slots'][hour];
				timetable.push(
					<ListItem key={i}>
						<Col>
							<Row><Text>{lesson}</Text></Row>
							<Row><Text style={styles.optionText}>{hour}</Text></Row>
						</Col>
					</ListItem>
				);
			}
		}

		var issues = [];

		for(let i = 0; i < this.state.issues.length; i++){
			var issue = this.state.issues[i];
			if(issue['roomName'] == this.state.selectedRoom){
				issues.push(
					<ListItem key={i}>
						<Col>
							<Row><Text>{issue['description']}</Text></Row>
							<Row><Text style={styles.optionText}>{issue['reportingDate']}</Text></Row>
						</Col>
						<Col><Icon name="info-outline" size={20} style={styles.icon}/></Col>
					</ListItem>
				);
			}
		}
		if(issues.length == 0){
			issues.push(
				<ListItem key = '0'>
					<Col>
						<Text>No Issues in this room</Text>
					</Col>
				</ListItem>
			);
		}

		var createIssueButton = null
		if(this.state.username !== undefined){
			createIssueButton = <Button style = {styles.button} onPress={this._showModal}><Text>Create Issue</Text></Button>
		}

		return (
			<Container>
				<Content padder disableKBDismissScroll style={{backgroundColor:'white'}}>
					<Grid style={styles.grid}>
						<Row>
							{socket}
						</Row>
						<Row>
							{seats}
						</Row>
					</Grid>
					<Grid style={styles.grid}>						
						<Row>
							<Text>Room Timetable:</Text>
						</Row>
						<Row>
							<ScrollView style={{ height:130}}>
							<List>
								{timetable}
							</List>
							</ScrollView>
						</Row>
					</Grid>
					<Grid style={styles.grid}>
						<Row>
							<Text>Issues:</Text>
						</Row>
						<Row>
							<ScrollView style={{ height:100}}>
							<List>
								{issues}
							</List>
							</ScrollView>
						</Row>
						<Row>
							{createIssueButton}
						</Row>
					</Grid>				
				</Content>
				<Modal isVisible={this.state.isModalVisible}>
					<Grid>
						<Row style={{height: '10%'}}></Row>
						<Row style={{height: '30%', backgroundColor: 'white'}}>
								<Form style={{width: '100%', padding:'5%'}}>
									<Text style={{marginBottom:10}}>Report Issue</Text>
									<TextInput style={{width: '100%'}} onChangeText={(text) => this.setState({text})} multiline={true} numberOfLines={8} placeholder="Write something." style={{height: '50%', textAlignVertical: 'top'}}/>
								</Form>
							</Row>
							<Row style={{height: 60, paddingBottom:'5%', paddingTop:3, backgroundColor: 'white'}}>
								<Col>
							<Button style={styles.btn} onPress={this._hideModal}>
								<Text style={styles.btnTxt}>Cancel</Text>
							</Button>
						</Col>
						<Col>
							<Button style={styles.btn} onPress={async() => {await this.sendIssue();}}>
								<Text style={styles.btnTxt}>Send Issue</Text>
							</Button>
						</Col>
					</Row>
				</Grid>
				</Modal>
			</Container>
		);
	}
}

const styles = StyleSheet.create({
	icon: {
		textAlign:'right',
	},
	optionText: {
		paddingLeft:5,
		paddingBottom:5,
		fontSize:15,
		color:'grey',
	},
	button: {
		margin:10,
		backgroundColor: '#009688',
		borderRadius: 10
	},
	grid:{
		height:'33%',
		padding:10,
	},
	mainRow:{
		marginBottom:20		
	},
  btn: {
    backgroundColor: '#009688',
    width: '80%',
    height: 40,
    alignSelf: 'center',
    borderRadius: 10
  },
  btnTxt: {
    width: '100%',
    color: 'white',
    textAlign: 'center'
  }
});