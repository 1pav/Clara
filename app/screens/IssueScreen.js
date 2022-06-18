import React, { Component } from 'react';
import { StyleSheet, Text, TextInput, AsyncStorage, ToastAndroid } from 'react-native'
import { Container, Content, Button, Icon, Body, Spinner, CardItem, Card, Left, Right, Fab, Form, Picker, Item as FormItem } from 'native-base';
import { Col, Row, Grid } from 'react-native-easy-grid';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Modal from 'react-native-modal';

const Item = Picker.Item;

export default class IssueScreen extends Component {
	constructor(props) {
		super(props);
		this.state = {
            isLoading: true,
            isModalVisible: false,
	        dataSource: undefined,
	        dataSource1: undefined,
	        selectedRoom: '',
	        text: '',
	        email: undefined,
	        issue_id: []
	    }
	    this.loadIssues();
	}


  	_hideModal = () => this.setState({ isModalVisible: false })

  	async loadDepartment() {
	    try {
	        const value = await AsyncStorage.getItem('department');
	        return value;
	    } catch (error) {
	        console.log(error);
	    };
	}

	async getEmail() {
	    try {
	        const value = await AsyncStorage.getItem('email');
	        this.setState({
	        	email: value
	        });
	    } catch (error) {
	        console.log(error);
	    };
	}

	async loadRooms(issueJson){
	    let dep =  await this.loadDepartment();
	    var url = 'https://clara-unitn.herokuapp.com/departments/' + dep + '/roomlist';

	    return fetch(url)
	          .then((response) => response.json())
	          .then((responseJson) => {
	            this.setState({
	              isLoading: false,
	              dataSource: responseJson,
	              dataSource1: issueJson
	            }, function() {
	            });
	          })
	          .catch((error) => {
	            console.error(error);
	          });
	}

	async loadIssues(){
		var dep = await AsyncStorage.getItem('department');
	    var url = 'https://clara-unitn.herokuapp.com/issues?deptName=' + dep;
	    var issues = []

	    return fetch(url)
          .then((response) => response.json())
          .then((responseJson) => {

          	for(i = 0; i < responseJson.length; i++)
          		issues[i] = responseJson[i]['_id'];

          	this.loadRooms(responseJson);
          	this.getEmail();
          	this.setState({
          		issue_id: issues 
          	});
          })
          .catch((error) => {
            console.error(error);
          });
	}

	onValueChangeRoom(value: string) {
	    this.setState({
	      selectedRoom: value
	    });
	}

	async sendIssue(){
		var claraUrl = 'https://clara-unitn.herokuapp.com/issues';
		var dep, id;
		if(this.state.selectedRoom !== '' && this.state.text !== ''){
			try {
		         dep = await AsyncStorage.getItem('department');
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
				deptName: dep,
				roomName: this.state.selectedRoom,
				type: '',
				description: this.state.text
			  })
			}).then((response) => {
	            this.setState({
	                isModalVisible: false,
					isLoading : true,
					text: ''
	            });
	            this.loadIssues();
			});
		}
	}

	async removeIssue(issue_id){
		var claraUrl = 'https://clara-unitn.herokuapp.com/issues';
		var id;
		
		try {
	         id = await AsyncStorage.getItem('id');
	    } catch (error) {
	        console.log(error);
	    };
	    fetch(claraUrl, {
		  method: "DELETE",
		  headers: {
		    Accept: "application/json",
		    "Content-Type": "application/json"
		  },
		  body: JSON.stringify({
	  		loginId: id,
			issueId: issue_id
		  })
		}).then((response) => {
            this.setState({
				isLoading : true,
            });
            this.loadIssues();
		});
	}

    render() {
     	if (this.state.isLoading) {
	        return (
	        	<Body>
					<Spinner color='#009688' />
	        	</Body>
	        );
	    }

	    rooms = [];
	    for(let i = 0; i < this.state.dataSource['roomList'].length; i++){
	      rooms.push(
	          <Item key={i} label={this.state.dataSource['roomList'][i]} value={this.state.dataSource['roomList'][i]}/>
	      );
	    }

		var issues = [];

		if (this.state.dataSource1.length == 0) {
			issues.push(
				<Row key='default'>
		      		<Card key='default'>
	                	<CardItem key='default'>
	                		<Body key='default' style={{marginLeft: '30%'}}>
	                			<Text key='default'>0 issues</Text>
	                		</Body>
	                	</CardItem>
	                </Card>
	            </Row>
	        );
		}

		x = 0
		if(this.state.email == 'clara150ore@example.org')
			x = 1;

		for(let i = 0; i < this.state.dataSource1.length; i++){
			var del = [];
			if(x == 1){
				del.push(
					<Right key='default'>
		        		<MaterialIcon name='delete' size={30} onPress={async () => {await this.removeIssue(this.state.issue_id[i])}}/>
		        	</Right>
				);
			}
	      	issues.push(
		      	<Row key={i}>
			      	<Card key={i}>
                        <CardItem key={i}>
                        	<Left>
				        		<Body>
									<Text style={{fontWeight: 'bold'}}>{this.state.dataSource1[i]['roomName']}
										<Text style={{fontWeight: 'normal'}}> - {this.state.dataSource1[i]['description']}</Text>
									</Text>								
									<Text note>Written from {this.state.dataSource1[i]['reporterMail']}</Text>
					        	</Body>
				        	</Left>
				        	{del}
				        </CardItem>
			        </Card>
		        </Row>
	      	);
	    }

	    return(
	    	<Container>
	    		<Content>
		    		<Grid style={{height: '100%', width: '100%'}}>	
		        		<Col>
		    				{issues}
		    			</Col>
		    		</Grid>		    		
		    	</Content>
		    	<Modal isVisible={this.state.isModalVisible}>
		    		<Grid>
		    			<Row style={{height: '10%'}}></Row>
		    			<Row style={{height: '30%', backgroundColor: 'white'}}>
				          <Form style={{width: '100%', padding:'5%'}}>
				            <Picker
				              mode="dropdown"
				              note={false}
				              selectedValue={this.state.selectedRoom}
				              onValueChange={this.onValueChangeRoom.bind(this)}
				              style={{width: '60%', marginLeft : '20%'}}
				            >
				              <Item label="Choose a room" value=''/>
				              {rooms}
				            </Picker>
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
								<Button style={styles.btn} onPress={async() => {await this.sendIssue(); }}>
									<Text style={styles.btnTxt}>Send Issue</Text>
								</Button>
							</Col>
						</Row>
					</Grid>
		    	</Modal>
		    	<Fab style={{backgroundColor: '#009688'}} position='bottomRight' onPress={
		    		async() => {
		    			var value;
						try {
					        value = await AsyncStorage.getItem('username');	 
					    } catch (error) {
					        console.log(error);
					    };
					    if(value !== null)
							this.setState({ isModalVisible: true });
						else{
							ToastAndroid.show('Log in before!' , ToastAndroid.SHORT);
						}
		    		}
		    	}>
		    		<MaterialIcon name="add" />
		    	</Fab>
	    	</Container>
	    )
	} 
}

const styles = StyleSheet.create({
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