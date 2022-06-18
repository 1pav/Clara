import React, { Component } from 'react'; 
import { StyleSheet, DatePickerAndroid, TimePickerAndroid, AsyncStorage } from 'react-native';
import { Content, Button, Text, Card, CardItem, Body, Left, Right, Spinner } from 'native-base';
import { Col, Row, Grid } from 'react-native-easy-grid'; 
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import FAIcon from 'react-native-vector-icons/FontAwesome';

export default class NewsContainer extends Component {

    constructor(props) {
        super(props);   
        this.state = {
            isLoading: true,
            dataSource: undefined
        }
        this.loadNews();
    }

    async loadDepartment() {
        try {
            const value = await AsyncStorage.getItem('department');
            return value;
        } catch (error) {
            console.log(error);
        };
    }

	async loadNews(){
		let dep =  await this.loadDepartment();		
		var url = 'https://clara-unitn.herokuapp.com/news/' + dep;
		
		return fetch(url)
	        .then((response) => response.json())
	        .then((responseJson) => {
	          this.setState({
	            isLoading: false,
	            dataSource: responseJson
	          }, function() {
	            // do something with new state
	          });
	        })
	        .catch((error) => {
	          console.error(error);
	        });
	}

	render() {
		//const { navigation } = this.props.navigation;

		if (this.state.isLoading) {
	        return (
	        	<Body>
					<Spinner color='#009688' />
	        	</Body>
	        );
	    }

		var news = [];

		if (this.state.dataSource.length == 0) {
			news.push(
				<Row key='default'>
		      		<Card key='default'>
	                	<CardItem key='default'>
	                		<Body key='default' style={{marginLeft: '30%'}}>
	                			<Text key='default'>Not available news</Text>
	                		</Body>
	                	</CardItem>
	                </Card>
	            </Row>
	        );
		}

		for(let i = 0; i < this.state.dataSource.length; i++){
	      	news.push(
		      	<Row key={i}>
			      	<Card key={i}>
                        <CardItem key={i}>
                        	<Left>
				        		<Body>
									<Text key={this.state.dataSource[i]}>{this.state.dataSource[i]}</Text>									
					        	</Body>
				        	</Left>		        	
				        </CardItem>
			        </Card>
		        </Row>
	      	);
	    }

	 	return ( 
	 		<Content>       
	        	<Grid style={{height: '100%', width: '100%'}}>	
	        		<Col>	        			
		        		{news}
	        		</Col>
	        	</Grid>
	        </Content>
	 	);
	} 
}