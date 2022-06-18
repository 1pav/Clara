import React, { Component } from 'react'; 
import { Container, Content, Button, Icon, Text } from 'native-base'; 
import { StyleSheet,ScrollView} from 'react-native';
import { Col, Row, Grid } from 'react-native-easy-grid'; 
import { email } from 'react-native-communications';

export default class NewsScreen extends Component { 
	constructor(props) {
		super(props);
	}

    onRowPress(someRowData) {
        this.props.navigation.navigate('Feedback', { someRowData });
    }

    render() {
        const { navigate } = this.props.navigation;
		return (
			<Container>

				<Container style={{flex:1}}>
          <ScrollView style={styles.emailUsTextScrollbox}>
            <Text style={styles.emailUsText}>
              Questions?{"\n"}
              Advices?{"\n"}
              Bugs?{"\n"}
              Need help?{"\n"}
              Feel free to write us!{"\n"}
              :){"\n"}{"\n"}{"\n"}{"\n"}{"\n"}{"\n"}
              <Text style={{fontSize: 10, fontFamily: 'monospace'}}>
                {" "}{" "}{" "}{" "}{" "}{" "}{" "}_..._{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{"\n"}
                {" "}{" "}{" "}{" "}.-'_..._''.{" "}.---.{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{"\n"}
                {" "}{" "}.'{" "}.'{" "}{" "}{" "}{" "}{" "}{" "}'.\|{" "}{" "}{" "}|{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{"\n"}
                {" "}/{" "}.'{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}|{" "}{" "}{" "}|{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{"\n"}
                .{" "}'{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}|{" "}{" "}{" "}|{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}.-,.--.{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{"\n"}
                |{" "}|{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}|{" "}{" "}{" "}|{" "}{" "}{" "}{" "}__{" "}{" "}{" "}{" "}|{" "}{" "}.-.{" "}|{" "}{" "}{" "}{" "}__{" "}{" "}{" "}{" "}{" "}{"\n"}
                |{" "}|{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}|{" "}{" "}{" "}|{" "}.:--.'.{" "}{" "}|{" "}|{" "}{" "}|{" "}|{" "}.:--.'.{" "}{" "}{" "}{"\n"}
                .{" "}'{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}|{" "}{" "}{" "}|/{" "}|{" "}{" "}{" "}\{" "}|{" "}|{" "}|{" "}{" "}|{" "}|/{" "}|{" "}{" "}{" "}\{" "}|{" "}{" "}{"\n"}
                {" "}\{" "}'.{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}.|{" "}{" "}{" "}|`"{" "}__{" "}|{" "}|{" "}|{" "}|{" "}{" "}'-{" "}`"{" "}__{" "}|{" "}|{" "}{" "}{"\n"}
                {" "}{" "}'.{" "}`._____.-'/|{" "}{" "}{" "}|{" "}.'.''|{" "}|{" "}|{" "}|{" "}{" "}{" "}{" "}{" "}{" "}.'.''|{" "}|{" "}{" "}{"\n"}
                {" "}{" "}{" "}{" "}`-.______{" "}/{" "}'---'/{" "}/{" "}{" "}{" "}|{" "}|_|{" "}|{" "}{" "}{" "}{" "}{" "}/{" "}/{" "}{" "}{" "}|{" "}|_{" "}{"\n"}
                {" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}`{" "}{" "}{" "}{" "}{" "}{" "}{" "}\{" "}\._,\{" "}'/|_|{" "}{" "}{" "}{" "}{" "}\{" "}\._,\{" "}'/{" "}{"\n"}
                {" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}`--'{" "}{" "}`"{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}{" "}`--'{" "}{" "}`"{" "}{" "}{"\n"}
                {"\n"}{"\n"}{"\n"}{"\n"}{"\n"}{"\n"}{"\n"}
              </Text>
            </Text>
          </ScrollView>
        	<Button iconLeft style={styles.buttonEmailUs} onPress={() => email(
        			['clara@example.org'],
        			null,
        			null,
        			'Clara App Feedback',
         			'Hi, I am writing you because I love Clara app!\n\n\nProudly sent from Clara app'
        		)}>
          	<Text style={styles.textButtonEmailUs}>Email to Clara developers</Text>
        	</Button>
        </Container>
      </Container>
		); 
	} 
}

const styles = StyleSheet.create({
  header:{
    marginBottom: '0%',
  },
  emailUsTextScrollbox: {
    marginBottom: '10%',
    marginTop:'10%',
    height: '10%'
  },
  emailUsText: {
    textAlign: 'center',
    fontSize: 40,
    fontFamily: 'monospace',
    fontWeight:'bold'
  },
  buttonEmailUs: {
    height: '10%',
    backgroundColor: '#009688',
    width: '50%',
    marginLeft: '25%',
    marginBottom: '10%',
    paddingTop: 10,
    paddingBottom: 20
  },
  textButtonEmailUs:{
    width: '100%',
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
});

