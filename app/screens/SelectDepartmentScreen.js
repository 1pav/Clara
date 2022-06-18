import React, { Component } from 'react'; 
import { StyleSheet, Text, AsyncStorage } from 'react-native';
import { Container, Content, Button, Picker, Form } from 'native-base';
import { Col, Row, Grid } from 'react-native-easy-grid'; 


const Item = Picker.Item;

export default class SelectDepartmentScreen extends Component {


    static navigationOptions = {
        header : null
    };

  constructor(props) {
    super(props);
    this.state = {
      selectedDep: undefined
    };
    this.onLoadDepartment();
  }

  async onLoadDepartment(){
    try {
      const value = await AsyncStorage.getItem('department');
      if (value !== null){
        this.setState({
          selectedDep: value
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  onValueChangeDep(value: string) {
    this.setState({
      selectedDep: value
    });
  }

  async onPressFindRoom(){
    try {
      if(this.state.selectedDep !== ''){
        await AsyncStorage.setItem('department' , this.state.selectedDep);
        const user = await AsyncStorage.getItem('email');
        if (user !== null){
            var claraUrl = 'https://clara-unitn.herokuapp.com/users/'+user;
            fetch(claraUrl, {
                method: "PUT",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    lastDept : this.state.selectedDep,
                })
            }).then((response) => {
              
            });
        }
        this.props.navigation.navigate('FreeRooms');
      }
    } catch (error) {
      console.log(error);
    }
  }

  render() { 
    return ( 
      <Container>        
        <Grid style={{height: '100%'}}>
          <Row style={{height: '20%', alignItems: 'center'}}>
            <Text style={styles.title}>Select your department</Text>
          </Row>
          <Row style={{height: '30%', width: '100%', justifyContent: 'center', alignItems: 'flex-end'}}>
            <Form>
              <Picker
                mode="dropdown"
                note={false}
                selectedValue={this.state.selectedDep}
                onValueChange={this.onValueChangeDep.bind(this)}
                style={{width: 300}}
              >
                <Item label="Seleziona un dipartimento" value=''/>
                <Item label="Facoltà di Giurisprudenza" value="giurisprudenza" />
                <Item label="Povo" value="povo" />
                <Item label="Economia e Management" value="economia" />
                <Item label="Mesiano" value="mesiano" />
                <Item label="Lettere e Filosofia" value="lettere" />
                <Item label="Psicologia e Scienze Cognitive" value="psicologia" />
                <Item label="Sociologia e Ricerca Sociale" value="sociologia" />
                <Item label="Centro Linguistico d'Ateneo" value="cla" />
              </Picker>
            </Form>            
          </Row>
          <Row style={{height: '50%', width: '100%', justifyContent: 'center', alignItems: 'flex-start'}}>
            <Button transparent onPress={() => this.onPressFindRoom()}>
              <Text style={styles.findRoom}>Find room</Text>
            </Button>
          </Row>
        </Grid>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  title: {
    width: '100%',
    textAlign: 'center',
    fontSize: 27,
  },
  findRoom: {
    textAlign: 'center',
    color: '#009688',
    fontSize: 27,
  },
});