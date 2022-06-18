import React, { Component } from 'react';
import { StyleSheet, DatePickerAndroid, TimePickerAndroid, AsyncStorage } from 'react-native';
import { Content, Button, Text, Card, CardItem, Body, Left, Right, Spinner } from 'native-base';
import { Col, Row, Grid } from 'react-native-easy-grid';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import FAIcon from 'react-native-vector-icons/FontAwesome';

var today = new Date();
var actually = today.getDate() + "/" + parseInt(today.getMonth() + 1) + "/" + today.getFullYear();
var localData = {
      now: today.getHours() + ":" + (today.getMinutes() < 10 ? '0' : '') + today.getMinutes(),
        selectedDate: today.getDate() + "/" + parseInt(today.getMonth() + 1) + "/" + today.getFullYear(),
    };zz

export default class FreeRoomsContainer extends Component {

    constructor(props) {
        super(props);
        let today = new Date();
        this.state = {
          dateUpdate: false,
            isLoading: true,
            dataSource: undefined,
            issueRooms: undefined
        }
        this.loadRooms();        
    }

    async loadDepartment() {
        try {
            const value = await AsyncStorage.getItem('department');
            return value;
        } catch (error) {
            console.log(error);
        };
    }

    async saveAndGo(key){
    try {
        if(localData['selectedDate'] !== ''){
         await AsyncStorage.setItem('selectedDate', localData['selectedDate']);
      }
      if(localData['now'] !== ''){
         await AsyncStorage.setItem('selectedTime', localData['now']);
      }
      if(key !== ''){
        await AsyncStorage.setItem('selectedRoom', key);
      }
      this.props.navigation.navigate('RoomScreen', {room: key});
    } catch (error) {
        console.log(error);
    }
  }

  async loadRooms(){
    //get selected date with this.state.selectedDate
    let dep =  await this.loadDepartment();
    var url = 'https://clara-unitn.herokuapp.com/departments/' + dep + '?time=' + localData.now + '&date=' + localData.selectedDate.replace(new RegExp('/', 'g'), '-');
    if (localData['selectedDate'] == actually) {
      url = 'https://clara-unitn.herokuapp.com/departments/' + dep + '?time=' + localData.now;
    }

    return fetch(url)
          .then((response) => response.json())
          .then((responseJson) => {
            this.setState({
              isLoading: true,
              dataSource: responseJson
            }, function() {
              this.loadIssues();
            });
          })
          .catch((error) => {
            console.error(error);
          });
  }

  async sendReq(){
    this.setState({
      isLoading: true
    });
    await this.loadRooms();
  }

  async chooseDate(){
    try {
      const {action, year, month, day} = await DatePickerAndroid.open({
        // Use `new Date()` for current date.
        date: new Date()
      });
      if(action == DatePickerAndroid.dateSetAction){
        localData['selectedDate'] = day + '/' + (month + 1) + '/' + year;
        localData['now'] = '8:00';
        this.setState({
          dateUpdate: !this.state.dateUpdate
        });
      }
    }catch ({code, message}) { console.warn('Cannot open date picker', message); }
  }

  async chooseTime(){
    try {
      const {action, hour, minute} = await TimePickerAndroid.open({
        // Use `new Date()` for current date.
        hour: Number(localData.now.split(":")[0]),
        minute: Number(localData.now.split(":")[1]),
        is24hour: true
      });
      if(action !== TimePickerAndroid.dismissedAction){
        var min = (minute < 10) ? '0' : '';
        localData['now'] = hour.toString() + ":" + min + minute.toString();
        this.setState({
          dateUpdate: !this.state.dateUpdate
        });
      }
    }catch ({code, message}) { console.warn('Cannot open date picker', message); }
  }

  async loadIssues(){
    var dep = await AsyncStorage.getItem('department');
      var url = 'https://clara-unitn.herokuapp.com/issues?deptName=' + dep;
      var issues = []

      return fetch(url)
          .then((response) => response.json())
          .then((responseJson) => {

            for(i = 0; i < responseJson.length; i++)
              issues.push(responseJson[i]['roomName']);
            this.setState({
              issueRooms: issues,
              isLoading: false
            });
          })
          .catch((error) => {
            console.error(error);
          });
  }

  render() {
    const { navigation } = this.props.navigation;

    if (this.state.isLoading) {
          return (
            <Body>
          <Spinner color='#009688' />
            </Body>
          );
      }

    var rooms = [];

    if (this.state.dataSource['items'].length == 0) {
      rooms.push(
        <Row key='default'>
              <Card key='default'>
                    <CardItem key='default'>
                      <Body key='default' style={{marginLeft: '30%'}}>
                        <Text key='default'>Not available rooms</Text>
                      </Body>
                    </CardItem>
                  </Card>
              </Row>
          );
    }

    for(let i = 0; i < this.state.dataSource['items'].length; i++){
        var icon = "map-marker";
        var power = null;
        if(!this.state.issueRooms.includes(this.state.dataSource['items'][i]['roomName']))
          icon = "map-marker";
        else
          icon = "exclamation";
        if(this.state.dataSource['items'][i]['electricalSockets'] == true)
          power = <MaterialIcon name="power" style={{fontSize: 30}}/>
          rooms.push(
            <Row key={this.state.dataSource['items'][i]['roomName']} onPress={() => this.saveAndGo(this.state.dataSource['items'][i]['roomName'])}>
              <Card key={this.state.dataSource['items'][i]['roomName']}>
                        <CardItem key={this.state.dataSource['items'][i]['roomName']}>
                          <Left>
                    <FAIcon name={icon} style={{fontSize: 30}}/>
                    <Body>
                <Text key={this.state.dataSource['items'][i]['roomName']} style={{fontWeight: 'bold'}}>{this.state.dataSource['items'][i]['roomName']}</Text>
                  <Text note>{'from '+this.state.dataSource['items'][i]['availability']['begin']+ ' to '+ this.state.dataSource['items'][i]['availability']['end'] }</Text>
                    </Body>
                  </Left>
                  <Right>
                    {power}
                  </Right>
                </CardItem>
              </Card>
            </Row>
          );
      }

     return (
       <Content>
            <Grid style={{height: '100%', width: '100%'}}>
              <Col>
                <Row style={{justifyContent: 'center'}}>
                  <Button style={styles.btnStyle} onPress = {() => this.chooseDate()}>
                    <Text>{localData.selectedDate}</Text>
                  </Button>
                  <Button style={styles.btnStyle} onPress = {() => this.chooseTime()}>
                    <Text>{localData.now}</Text>
                  </Button>
                  <Button iconLeft transparent style={styles.btnStyle1} onPress = {() => this.sendReq()}>
                    <MaterialIcon name='chevron-right' size={50} color='#009688'/>
                  </Button>
                </Row>
                {rooms}
              </Col>
            </Grid>
          </Content>
     );
  }
}

const styles = StyleSheet.create({
  btnStyle: {
    backgroundColor: '#009688',
    borderWidth: 0,
    borderRadius: 10,
    margin: 5,
    marginRight: 3
  },
  btnStyle1: {
    marginTop: 8,
  }
});
