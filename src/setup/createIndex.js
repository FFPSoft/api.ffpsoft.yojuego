http://localhost:9200/
PUT yojuego

http://localhost:9200/yojuego/user/
PUT _mapping
{
    "user": {
        "properties": {
            "id": {
                "type": "string",
                "index": "not_analyzed"
            },
            "password": {
                "type": "string"
            },
            "type": {
                "type": "string",
                "index": "not_analyzed"
            },
            "userAudit": {
                "createdBy": {
                    "type": "string",
                    "index": "not_analyzed"
                },
                "createdOn": { "type": "date" },
                "createdFrom": {"type":"string"}
                "modifiedBy": {
                    "type": "string",
                    "index": "not_analyzed"
                },
                "modifiedOn": { "type": "date" },
                "modifiedFrom": {"type":"string"}
            }
        }
    }
}


http://localhost:9200/yojuego/player/
PUT _mapping
{
    "player": {
        "properties": {
            "firstName": {
                "type": "string"
            },
            "lastName": {
                "type": "string"
            },
            "nickName": {
                "type": "string"
            },
            "userid": {
                "type": "string",
                "index": "not_analyzed"
            },
            "playerAudit": {
                "createdBy": {
                    "type": "string",
                    "index": "not_analyzed"
                },
                "createdOn": { "type": "date" },
                "createdFrom": {"type":"string"}
                "modifiedBy": {
                    "type": "string",
                    "index": "not_analyzed"
                },
                "modifiedOn": { "type": "date" },
                "modifiedFrom": {"type":"string"}
            }
        }
    }
}

http://localhost:9200/yojuego/match/
PUT _mapping
{
    "match": {
        "properties": {
            "title": { "type": "string" },
            "date": { "type": "date" },
            "fromTime": { "type": "string" },
            "toTime": { "type": "string" },
            "location": { "type": "string" },
            "matchType": { "type": "integer" },
            "creator": {
                "type": "string",
                    "index": "not_analyzed"
            },
            "confirmedPlayers" : {
                "type": "string",
                    "index": "not_analyzed"
            },
            "pendingPlayers" : {
                "type": "string",
                    "index": "not_analyzed"
            },
            "comments" : {
                "properties" : {
                    "id" : { "type" : "integer" },
                    "owner" : { "type" : "string" },
                    "text" : { "type" : "string" },
                    "writtenOn": { "type": "date" }
                }
            },
            "matchAudit": {
                "createdBy": {
                    "type": "string",
                    "index": "not_analyzed"
                },
                "createdOn": { "type": "date" },
                "createdFrom": {"type":"string"}
                "modifiedBy": {
                    "type": "string",
                    "index": "not_analyzed"
                },
                "modifiedOn": { "type": "date" },
                "modifiedFrom": {"type":"string"}
            }
        }
    }
}

http://localhost:9200/yojuego/friendship/
PUT _mapping
{
    "friendship": {
        "properties": {
            "playerId": {
                "type": "string",
                    "index": "not_analyzed"
            },
            "friendId": {
                "type": "string",
                    "index": "not_analyzed"
            },
            "status": { "type": "string" },
            "info" : {
                "properties" : {
                    "email" : { "type" : "string" },
                    "phone" : { "type" : "string" },
                    "photo" : { "type" : "string" },
                    "firstName": { "type": "string" },
                    "lastName": { "type": "string" },
                    "nickName": { "type": "string" }
                }
            },
            "friendshipAudit": {
                "createdBy": {
                    "type": "string",
                    "index": "not_analyzed"
                },
                "createdOn": { "type": "date" },
                "createdFrom": {"type":"string"}
                "modifiedBy": {
                    "type": "string",
                    "index": "not_analyzed"
                },
                "modifiedOn": { "type": "date" },
                "modifiedFrom": {"type":"string"}
            }
        }
    }
}

http://localhost:9200/yojuego/group/
PUT _mapping
{
    "group": {
        "properties": {
            "description": { "type": "string" },
            "photo": { "type": "string" },
            "players" : {
                "type": "string",
                "index": "not_analyzed"
            },
            "admins" : {
                "type": "string",
                "index": "not_analyzed"
            },
            "groupAudit": {
                "createdBy": {
                    "type": "string",
                    "index": "not_analyzed"
                },
                "createdOn": { "type": "date" },
                "createdFrom": {"type":"string"}
                "modifiedBy": {
                    "type": "string",
                    "index": "not_analyzed"
                },
                "modifiedOn": { "type": "date" },
                "modifiedFrom": {"type":"string"}
            }
        }
    }
}

http://localhost:9200/yojuego/club/
PUT _mapping
{
    "club": {
        "properties": {
            "isActive": { "type": "boolean" },
            "description": { "type": "string" },
            "allowOnLineBooking": { "type": "boolean" },
            "allowOnLinePayment": { "type": "boolean" },
            "cancelingTimeForFree": { "type": "string" },
            "facilities" : {
                "properties" : {
                    "buffet" : { "type" : "boolean" },
                    "parking" : { "type" : "boolean" },
                    "wifi" : { "type" : "boolean" },
                    "dressingRoom" : { "type" : "boolean" }
                }
            },
            "fields" : {
                "properties" : {
                    "id" : { "type" : "integer" },
                    "groundType" : { "type" : "integer" },
                    "roofed" : { "type" : "boolean" },
                    "size" : { "type" : "integer" },
                    "value" : { "type" : "double" },
                    "minToBook" : { "type" : "double" }
                }
            },
            "contactInfo" : {
                "properties" : {
                    "mails" : {
                        "properties" : {
                            "mail": {
                                "type": "string",
                                    "index": "not_analyzed"
                            }
                        }
                    },
                    "telephones" : {
                        "properties" : {
                            "telephone": {
                                "type": "string",
                                    "index": "not_analyzed"
                            }
                        }
                    },
                    "location": {
                        "properties" : {
                            "latitude": {
                                "type": "string",
                                    "index": "not_analyzed"
                            },
                            "longitude": {
                                "type": "string",
                                    "index": "not_analyzed"
                            },
                            "state": {
                                "type": "string",
                                    "index": "not_analyzed"
                            },
                            "city": {
                                "type": "string",
                                    "index": "not_analyzed"
                            }
                        }
                    }
                }
            },
            "calendar" : {
                "properties" : {
                    "events" : {
                        "properties" : {
                            "date": {
                                "type": "date",
                                    "index": "not_analyzed"
                            },
                            "matchId": {
                                "type": "string",
                                    "index": "not_analyzed"
                            }
                        }
                    }
                }
            }
        }
    }
}

http://localhost:9200/yojuego/invitation/
PUT _mapping
{
    "invitation": {
        "properties": {
            "senderId": {
                "type": "string",
                    "index": "not_analyzed"
            },
            "recipientId": {
                "type": "string",
                    "index": "not_analyzed"
            },
            "matchId": {
                "type": "string",
                    "index": "not_analyzed"
            },
            "createdOn": { "type": "date" },
            "state": { "type": "string" }
        }
    }
}

http://localhost:9200/yojuego/device/
PUT _mapping
{
    "invitation": {
        "properties": {
            "deviceId": {
                "type": "string",
                    "index": "not_analyzed"
            },
            "platform": {
                "type": "string",
                    "index": "not_analyzed"
            },
            "userId": {
                "type": "string",
                    "index": "not_analyzed"
            },
            "createdOn": { "type": "date" }
        }
    }
}