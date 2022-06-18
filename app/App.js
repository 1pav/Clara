import React from 'react';
import {
    DrawerNavigator,
    StackNavigator,
    TabNavigator
} from 'react-navigation';
import Icon from 'react-native-vector-icons/MaterialIcons';
import StartScreen from './screens/StartScreen';
import SelectDepartmentScreen from './screens/SelectDepartmentScreen';
import FreeRoomsScreen from './screens/FreeRoomsScreen';
import NewsScreen from './screens/NewsScreen';
import ContactUs from './screens/ContactUs';
import SideMenuContent from './screens/SideMenuScreen';
import RoomScreen from './screens/RoomScreen';
import IssueScreen from './screens/IssueScreen';
import {
    AsyncStorage
} from 'react-native';
import AppLoading from 'expo';

class App extends React.Component {

    constructor(props) {
        super(props);
        //AsyncStorage.clear(); // Uncomment this row if you want reset the local storage
        this.onLoadStart();
    }

    async loadFont() {
        await Expo.Font.loadAsync({
            Roboto: require("native-base/Fonts/Roboto.ttf"),
            Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf"),
            Ionicons: require("@expo/vector-icons/fonts/Ionicons.ttf")
        });
    }

    async onLoadStart() {
        try {
            const value = await AsyncStorage.getItem('department');
            await this.loadFont();
            if (value !== null) {
                this.props.navigation.navigate('FreeRooms');
            } else {
                this.props.navigation.navigate('Start');
            }
        } catch (error) {
            console.log(error);
        }
    }

    render() {
        return null;
    }
}

const FooterNavigator = TabNavigator({
    FreeRooms: {
        screen: FreeRoomsScreen,
        navigationOptions: ({
            navigation
        }) => ({
            title: 'Free Rooms',
            headerLeft: < Icon onPress = {
                () => navigation.navigate('DrawerOpen')
            }
            size = {
                25
            }
            name = "menu"
            style = {
                {
                    marginLeft: 10
                }
            }
            />,
            tabBarIcon: < Icon name = "apps"
            size = {
                25
            }
            style = {
                {
                    color: 'white'
                }
            }
            />,
        })
    },
    News: {
        screen: NewsScreen,
        navigationOptions: ({
            navigation
        }) => ({
            title: 'News',
            headerLeft: < Icon onPress = {
                () => navigation.navigate('DrawerOpen')
            }
            size = {
                25
            }
            name = "menu"
            style = {
                {
                    marginLeft: 10
                }
            }
            />,
            tabBarIcon: < Icon name = "error-outline"
            size = {
                25
            }
            style = {
                {
                    color: 'white'
                }
            }
            />
        })
    },

}, {
    tabBarPosition: 'bottom',
    animationEnabled: true,
    tabBarOptions: {
        showLabel: false,
        showIcon: true,
        indicatorStyle: {
            backgroundColor: 'white'
        },
        style: {
            backgroundColor: '#009688'
        }
    }
});

const StartNavigatorRoute = {
    Start: {
        screen: StartScreen,
    },
    SelectDepartment: {
        screen: SelectDepartmentScreen,
    },

    FooterNavigator: {
        screen: FooterNavigator,
    },

    RoomScreen: {
        screen: RoomScreen,
        navigationOptions: ({
            navigation
        }) => ({
            title: navigation.state.params.room
        })
    },
    FreeRooms: {
        screen: FooterNavigator,

    },
    News: {
        screen: FooterNavigator,

    },
    ContactUs: {
        screen: ContactUs,
        navigationOptions: ({
            navigation
        }) => ({
            title: 'Contact Us',
        })
    },
    IssueScreen: {
        screen: IssueScreen,
        navigationOptions: ({
            navigation
        }) => ({
            title: 'Issues'
        })
    },

};

const SideMenuRoute = {

    Start: {
        name: 'Start',
        screen: StackNavigator(StartNavigatorRoute, {
            initialRouteName: 'Start'
        })

    },

    FooterNavigator: {
        name: 'footerNavigator',
        screen: StackNavigator(StartNavigatorRoute, {
            initialRouteName: 'FooterNavigator'
        })
    },
    FreeRooms: {
        name: 'free rooms',
        screen: StackNavigator(StartNavigatorRoute, {
            initialRouteName: 'FreeRooms'
        })
    },
    News: {
        name: 'news',
        screen: StackNavigator(StartNavigatorRoute, {
            initialRouteName: 'News'
        })

    },
    ContactUs: {
        name: 'contact us',
        screen: StackNavigator(StartNavigatorRoute, {
            initialRouteName: 'ContactUs',
        })
    },
    RoomScreen: {
        name: 'room screen',
        screen: StackNavigator(StartNavigatorRoute, {
            initialRouteName: 'RoomScreen'
        })
    }
};

const SplashnavigationRoute = {
    App: {
        screen: App,
    },
    Start: {
        screen: StartScreen,
    },
    SelectDepartment: {
        screen: SelectDepartmentScreen,
    },

    HomePage: {
        screen: DrawerNavigator(SideMenuRoute, {
            initialRouteName: 'FooterNavigator',
            contentComponent: SideMenuContent
        }),
    },
}

const RootNavigator = StackNavigator({
    Splash: {
        name: 'Splash_navigator',
        screen: StackNavigator(
            SplashnavigationRoute, {
                headerMode: 'none',
            }
        ),

    },

    Drawer: {
        name: 'SideMenu',
        screen: DrawerNavigator(
            SideMenuRoute, {
                contentComponent: SideMenuContent,
            }
        ),
    },
    Tab: {
        name: 'TabNavigator',
        screen: FooterNavigator,
    },

    Stack: {
        name: 'Start_Navigator',
        screen: StackNavigator(
            StartNavigatorRoute,
        ),
    },

}, {
    headerMode: 'none',
});

export default RootNavigator;

//DONE: [WARNING: lock rotation]