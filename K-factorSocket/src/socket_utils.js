module.exports = function(app) {
    
    app.locals.appData = {};
    app.locals.appData.activeUserDetails = {};
    app.locals.appData.activeConnections = {};
    app.locals.appData.challengeDetails = {};
    app.locals.appData.questionBank = {};
    app.locals.appData.challengeDetails.fakeChallengeId = 100;
    app.locals.serviceURL = 'http://localhost:4444/quizUp/v1/';
    
    app.locals.appData.activeUserListTemplate = {
        data: [],
        success: true,
        infoMsg: "List of active users",
        type: "ACTIVE_USERS"
    };

    app.locals.appData.challengeRespTemplate = {
        data: [],
        success: true,
        infoMsg: "",
        type: "C_NOTIFY"
    }
    app.locals.appData.challengeAcceptResp = {
        data: [],
        type: "R_NOTIFY",
        success: true,
        infoMsg: ""
    }
    app.locals.appData.questionRespTemplate = {
        "data": [],
        "type": "Q_RESP",
        "success": true,
        "infoMsg": ""
    };
    app.locals.appData.answerRespTemplate = {
        "data": [],
        "type": "A_RESP",
        "success": true,
        "infoMsg": ""
    }

    app.locals.appData.questionBank = {};
    //quizid 123
    app.locals.appData.questionBank["1234"] = {
        //quizid
        id: "1234",
        questions: [{
                "id": "200",
                "description": "question 1",
                "options": [{
                        "id": "1",
                        "value": "option 1",
                        "isCorrect": false
                    },
                    {
                        "id": "2",
                        "value": "option 2",
                        "isCorrect": false
                    },
                    {
                        "id": "3",
                        "value": "option 3",
                        "isCorrect": false
                    },
                    {
                        "id": "4",
                        "value": "option 4",
                        "isCorrect": true
                    }
                ]
            },
            {
                "id": "201",
                "description": "question 2",
                "options": [{
                        "id": "1",
                        "value": "option 1",
                        "isCorrect": false
                    },
                    {
                        "id": "2",
                        "value": "option 2",
                        "isCorrect": false
                    },
                    {
                        "id": "3",
                        "value": "option 3",
                        "isCorrect": false
                    },
                    {
                        "id": "4",
                        "value": "option 4",
                        "isCorrect": true
                    }
                ]
            },
            {
                "id": "202",
                "description": "question 3",
                "options": [{
                        "id": "1",
                        "value": "option 1",
                        "isCorrect": false
                    },
                    {
                        "id": "2",
                        "value": "option 2",
                        "isCorrect": true
                    },
                    {
                        "id": "3",
                        "value": "option 3",
                        "isCorrect": false
                    },
                    {
                        "id": "4",
                        "value": "option 4",
                        "isCorrect": false
                    }
                ]
            },
            {
                "id": "203",
                "description": "question 4",
                "options": [{
                        "id": "1",
                        "value": "option 1",
                        "isCorrect": true
                    },
                    {
                        "id": "2",
                        "value": "option 2",
                        "isCorrect": false
                    },
                    {
                        "id": "3",
                        "value": "option 3",
                        "isCorrect": false
                    },
                    {
                        "id": "4",
                        "value": "option 4",
                        "isCorrect": false
                    }
                ]
            },
            {
                "id": "204",
                "description": "question 5",
                "options": [{
                        "id": "1",
                        "value": "option 1",
                        "isCorrect": false
                    },
                    {
                        "id": "2",
                        "value": "option 2",
                        "isCorrect": false
                    },
                    {
                        "id": "3",
                        "value": "option 3",
                        "isCorrect": true
                    },
                    {
                        "id": "4",
                        "value": "option 4",
                        "isCorrect": false
                    }
                ]
            },
            {
                "id": "205",
                "description": "question 5",
                "options": [{
                        "id": "1",
                        "value": "option 1",
                        "isCorrect": false
                    },
                    {
                        "id": "2",
                        "value": "option 2",
                        "isCorrect": true
                    },
                    {
                        "id": "3",
                        "value": "option 3",
                        "isCorrect": false
                    },
                    {
                        "id": "4",
                        "value": "option 4",
                        "isCorrect": false
                    }
                ]
            }
        ],
    };
    app.locals.serverToken = '--Provide static token here--';
    return app;
}