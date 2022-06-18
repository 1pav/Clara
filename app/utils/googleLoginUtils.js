module.exports = {
    getUserInfo: async function (accessToken) {
        let userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
        });

        //extract useful data from response
        let usefulUserInfo = JSON.parse(userInfoResponse._bodyInit);

        //check the right domain
        let unitnDomain = 'studenti.unitn.it';
        if (usefulUserInfo.hd == unitnDomain) {
            await this.registerDb(usefulUserInfo);
            return usefulUserInfo;
        } else if (usefulUserInfo.email == 'clara150ore@example.org') {
            await this.registerDb(usefulUserInfo);
            return usefulUserInfo;
        } else {
            return false;
        }
    },

    registerDb: async function (infoUser) {
        var claraUrl = 'https://clara-unitn.herokuapp.com/users/';
        fetch(claraUrl, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: infoUser.email,
                loginId: infoUser.id,
            })
        }).then(() => {});
    },

    signInWithGoogleAsync: async function () {
        try {
            const result = await Expo.Google.logInAsync({
                androidClientId: '',
                iosClientId: '',
                androidStandaloneAppClientId: '',
                webClientId: '',
                behavior: 'web',
                scopes: ['profile', 'email'],
            });

            if (result.type === 'success') {
                let res = await this.getUserInfo(result.accessToken);
                return res;
            } else {
                return {
                    cancelled: true
                };

            }
        } catch (e) {
            return {
                error: true
            };

        }
    }
};