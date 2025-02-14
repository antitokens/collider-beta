export type ColliderBeta = {
  "version": "1.0.0-beta",
  "name": "collider_beta",
  "instructions": [
    {
      "name": "initialiseAdmin",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "updatePollCreationFee",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "newFee",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateMaxTitleLength",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "newLength",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateMaxDescriptionLength",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "newLength",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateTruthBasis",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "newBasis",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateFloatBasis",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "newBasis",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateMinDepositAmount",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "newMinAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateAntiMint",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "newMint",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "updateProMint",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "newMint",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "updateMultisig",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "newMultisig",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "setAuthority",
      "accounts": [
        {
          "name": "state",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "poll",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pollAntiToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pollProToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "pollIndex",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initialiser",
      "accounts": [
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createPoll",
      "accounts": [
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poll",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pollAntiToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pollProToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "antiMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "proMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "startTime",
          "type": "string"
        },
        {
          "name": "endTime",
          "type": "string"
        },
        {
          "name": "etc",
          "type": {
            "option": "bytes"
          }
        }
      ]
    },
    {
      "name": "depositTokens",
      "accounts": [
        {
          "name": "poll",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userAntiToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userProToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pollAntiToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pollProToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "pollIndex",
          "type": "u64"
        },
        {
          "name": "anti",
          "type": "u64"
        },
        {
          "name": "pro",
          "type": "u64"
        }
      ]
    },
    {
      "name": "equaliseTokens",
      "accounts": [
        {
          "name": "poll",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userAntiToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userProToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pollAntiToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pollProToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "pollIndex",
          "type": "u64"
        },
        {
          "name": "truth",
          "type": {
            "vec": "u64"
          }
        }
      ]
    },
    {
      "name": "bulkWithdrawTokens",
      "accounts": [
        {
          "name": "poll",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pollAntiToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pollProToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "pollIndex",
          "type": "u64"
        }
      ]
    },
    {
      "name": "userWithdrawTokens",
      "accounts": [
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poll",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userAntiToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userProToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pollAntiToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pollProToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "pollIndex",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "adminAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "initialised",
            "type": "bool"
          },
          {
            "name": "pollCreationFee",
            "type": "u64"
          },
          {
            "name": "maxTitleLength",
            "type": "u64"
          },
          {
            "name": "maxDescriptionLength",
            "type": "u64"
          },
          {
            "name": "truthBasis",
            "type": "u64"
          },
          {
            "name": "floatBasis",
            "type": "u64"
          },
          {
            "name": "minDepositAmount",
            "type": "u64"
          },
          {
            "name": "antitokenMultisig",
            "type": "publicKey"
          },
          {
            "name": "antiMintAddress",
            "type": "publicKey"
          },
          {
            "name": "proMintAddress",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "stateAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pollIndex",
            "type": "u64"
          },
          {
            "name": "authority",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "pollAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "index",
            "type": "u64"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "startTime",
            "type": "string"
          },
          {
            "name": "endTime",
            "type": "string"
          },
          {
            "name": "etc",
            "type": {
              "option": "bytes"
            }
          },
          {
            "name": "anti",
            "type": "u64"
          },
          {
            "name": "pro",
            "type": "u64"
          },
          {
            "name": "deposits",
            "type": {
              "vec": {
                "defined": "UserDeposit"
              }
            }
          },
          {
            "name": "equalised",
            "type": "bool"
          },
          {
            "name": "equalisationResults",
            "type": {
              "option": {
                "defined": "EqualisationResult"
              }
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "UserDeposit",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "address",
            "type": "publicKey"
          },
          {
            "name": "anti",
            "type": "u64"
          },
          {
            "name": "pro",
            "type": "u64"
          },
          {
            "name": "u",
            "type": "u64"
          },
          {
            "name": "s",
            "type": "u64"
          },
          {
            "name": "withdrawn",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "EqualisationResult",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "anti",
            "type": {
              "vec": "u64"
            }
          },
          {
            "name": "pro",
            "type": {
              "vec": "u64"
            }
          },
          {
            "name": "truth",
            "type": {
              "vec": "u64"
            }
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "CreatePollBumps",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "state",
            "type": "u8"
          },
          {
            "name": "poll",
            "type": "u8"
          },
          {
            "name": "pollAntiToken",
            "type": "u8"
          },
          {
            "name": "pollProToken",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "BulkWithdrawTokensBumps",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "poll",
            "type": "u8"
          },
          {
            "name": "pollAntiToken",
            "type": "u8"
          },
          {
            "name": "pollProToken",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "UserWithdrawTokensBumps",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "state",
            "type": "u8"
          },
          {
            "name": "poll",
            "type": "u8"
          },
          {
            "name": "pollAntiToken",
            "type": "u8"
          },
          {
            "name": "pollProToken",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "SetPollTokenAuthorityBumps",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "state",
            "type": "u8"
          },
          {
            "name": "pollAntiToken",
            "type": "u8"
          },
          {
            "name": "pollProToken",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "AdminBumps",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "UpdateBumps",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "KeyValue",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "key",
            "type": "string"
          },
          {
            "name": "value",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "PredictError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "InsufficientPayment"
          },
          {
            "name": "PollInactive"
          },
          {
            "name": "PollActive"
          },
          {
            "name": "PollEnded"
          },
          {
            "name": "TitleTooLong"
          },
          {
            "name": "DescriptionTooLong"
          },
          {
            "name": "InvalidTimeFormat"
          },
          {
            "name": "InvalidTimeRange"
          },
          {
            "name": "StartTimeInPast"
          },
          {
            "name": "InsufficientDeposit"
          },
          {
            "name": "InvalidTokenAccount"
          },
          {
            "name": "Unauthorised"
          },
          {
            "name": "AlreadyInitialised"
          },
          {
            "name": "InvalidTruthValues"
          },
          {
            "name": "MathError"
          },
          {
            "name": "TitleExists"
          },
          {
            "name": "PollNotFound"
          },
          {
            "name": "NotEqualised"
          },
          {
            "name": "NoDeposit"
          },
          {
            "name": "AlreadyWithdrawn"
          },
          {
            "name": "InvalidEqualisation"
          },
          {
            "name": "AlreadyEqualised"
          },
          {
            "name": "NoDeposits"
          },
          {
            "name": "UserWithdrawalsNotEnabled"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "PollCreatedEvent",
      "fields": [
        {
          "name": "pollIndex",
          "type": "u64",
          "index": false
        },
        {
          "name": "address",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "title",
          "type": "string",
          "index": false
        },
        {
          "name": "startTime",
          "type": "string",
          "index": false
        },
        {
          "name": "endTime",
          "type": "string",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "DepositEvent",
      "fields": [
        {
          "name": "pollIndex",
          "type": "u64",
          "index": false
        },
        {
          "name": "address",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "anti",
          "type": "u64",
          "index": false
        },
        {
          "name": "pro",
          "type": "u64",
          "index": false
        },
        {
          "name": "u",
          "type": "u64",
          "index": false
        },
        {
          "name": "s",
          "type": "u64",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "EqualisationEvent",
      "fields": [
        {
          "name": "pollIndex",
          "type": "u64",
          "index": false
        },
        {
          "name": "truth",
          "type": {
            "vec": "u64"
          },
          "index": false
        },
        {
          "name": "anti",
          "type": "u64",
          "index": false
        },
        {
          "name": "pro",
          "type": "u64",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "WithdrawEvent",
      "fields": [
        {
          "name": "pollIndex",
          "type": "u64",
          "index": false
        },
        {
          "name": "address",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "anti",
          "type": "u64",
          "index": false
        },
        {
          "name": "pro",
          "type": "u64",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "PollUpdateEvent",
      "fields": [
        {
          "name": "pollIndex",
          "type": "u64",
          "index": false
        },
        {
          "name": "fieldUpdated",
          "type": "string",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "AdminEvent",
      "fields": [
        {
          "name": "action",
          "type": "string",
          "index": false
        },
        {
          "name": "args",
          "type": {
            "vec": {
              "defined": "KeyValue"
            }
          },
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "Unauthorised",
      "msg": "Unauthorised"
    }
  ]
};

export const IDL: ColliderBeta = {
  "version": "1.0.0-beta",
  "name": "collider_beta",
  "instructions": [
    {
      "name": "initialiseAdmin",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "updatePollCreationFee",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "newFee",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateMaxTitleLength",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "newLength",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateMaxDescriptionLength",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "newLength",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateTruthBasis",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "newBasis",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateFloatBasis",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "newBasis",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateMinDepositAmount",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "newMinAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateAntiMint",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "newMint",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "updateProMint",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "newMint",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "updateMultisig",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "newMultisig",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "setAuthority",
      "accounts": [
        {
          "name": "state",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "poll",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pollAntiToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pollProToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "pollIndex",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initialiser",
      "accounts": [
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createPoll",
      "accounts": [
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poll",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pollAntiToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pollProToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "antiMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "proMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "startTime",
          "type": "string"
        },
        {
          "name": "endTime",
          "type": "string"
        },
        {
          "name": "etc",
          "type": {
            "option": "bytes"
          }
        }
      ]
    },
    {
      "name": "depositTokens",
      "accounts": [
        {
          "name": "poll",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userAntiToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userProToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pollAntiToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pollProToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "pollIndex",
          "type": "u64"
        },
        {
          "name": "anti",
          "type": "u64"
        },
        {
          "name": "pro",
          "type": "u64"
        }
      ]
    },
    {
      "name": "equaliseTokens",
      "accounts": [
        {
          "name": "poll",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userAntiToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userProToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pollAntiToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pollProToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "pollIndex",
          "type": "u64"
        },
        {
          "name": "truth",
          "type": {
            "vec": "u64"
          }
        }
      ]
    },
    {
      "name": "bulkWithdrawTokens",
      "accounts": [
        {
          "name": "poll",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "pollAntiToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pollProToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "pollIndex",
          "type": "u64"
        }
      ]
    },
    {
      "name": "userWithdrawTokens",
      "accounts": [
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poll",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userAntiToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userProToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pollAntiToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pollProToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "pollIndex",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "adminAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "initialised",
            "type": "bool"
          },
          {
            "name": "pollCreationFee",
            "type": "u64"
          },
          {
            "name": "maxTitleLength",
            "type": "u64"
          },
          {
            "name": "maxDescriptionLength",
            "type": "u64"
          },
          {
            "name": "truthBasis",
            "type": "u64"
          },
          {
            "name": "floatBasis",
            "type": "u64"
          },
          {
            "name": "minDepositAmount",
            "type": "u64"
          },
          {
            "name": "antitokenMultisig",
            "type": "publicKey"
          },
          {
            "name": "antiMintAddress",
            "type": "publicKey"
          },
          {
            "name": "proMintAddress",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "stateAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pollIndex",
            "type": "u64"
          },
          {
            "name": "authority",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "pollAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "index",
            "type": "u64"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "startTime",
            "type": "string"
          },
          {
            "name": "endTime",
            "type": "string"
          },
          {
            "name": "etc",
            "type": {
              "option": "bytes"
            }
          },
          {
            "name": "anti",
            "type": "u64"
          },
          {
            "name": "pro",
            "type": "u64"
          },
          {
            "name": "deposits",
            "type": {
              "vec": {
                "defined": "UserDeposit"
              }
            }
          },
          {
            "name": "equalised",
            "type": "bool"
          },
          {
            "name": "equalisationResults",
            "type": {
              "option": {
                "defined": "EqualisationResult"
              }
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "UserDeposit",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "address",
            "type": "publicKey"
          },
          {
            "name": "anti",
            "type": "u64"
          },
          {
            "name": "pro",
            "type": "u64"
          },
          {
            "name": "u",
            "type": "u64"
          },
          {
            "name": "s",
            "type": "u64"
          },
          {
            "name": "withdrawn",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "EqualisationResult",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "anti",
            "type": {
              "vec": "u64"
            }
          },
          {
            "name": "pro",
            "type": {
              "vec": "u64"
            }
          },
          {
            "name": "truth",
            "type": {
              "vec": "u64"
            }
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "CreatePollBumps",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "state",
            "type": "u8"
          },
          {
            "name": "poll",
            "type": "u8"
          },
          {
            "name": "pollAntiToken",
            "type": "u8"
          },
          {
            "name": "pollProToken",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "BulkWithdrawTokensBumps",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "poll",
            "type": "u8"
          },
          {
            "name": "pollAntiToken",
            "type": "u8"
          },
          {
            "name": "pollProToken",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "UserWithdrawTokensBumps",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "state",
            "type": "u8"
          },
          {
            "name": "poll",
            "type": "u8"
          },
          {
            "name": "pollAntiToken",
            "type": "u8"
          },
          {
            "name": "pollProToken",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "SetPollTokenAuthorityBumps",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "state",
            "type": "u8"
          },
          {
            "name": "pollAntiToken",
            "type": "u8"
          },
          {
            "name": "pollProToken",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "AdminBumps",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "UpdateBumps",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "KeyValue",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "key",
            "type": "string"
          },
          {
            "name": "value",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "PredictError",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "InsufficientPayment"
          },
          {
            "name": "PollInactive"
          },
          {
            "name": "PollActive"
          },
          {
            "name": "PollEnded"
          },
          {
            "name": "TitleTooLong"
          },
          {
            "name": "DescriptionTooLong"
          },
          {
            "name": "InvalidTimeFormat"
          },
          {
            "name": "InvalidTimeRange"
          },
          {
            "name": "StartTimeInPast"
          },
          {
            "name": "InsufficientDeposit"
          },
          {
            "name": "InvalidTokenAccount"
          },
          {
            "name": "Unauthorised"
          },
          {
            "name": "AlreadyInitialised"
          },
          {
            "name": "InvalidTruthValues"
          },
          {
            "name": "MathError"
          },
          {
            "name": "TitleExists"
          },
          {
            "name": "PollNotFound"
          },
          {
            "name": "NotEqualised"
          },
          {
            "name": "NoDeposit"
          },
          {
            "name": "AlreadyWithdrawn"
          },
          {
            "name": "InvalidEqualisation"
          },
          {
            "name": "AlreadyEqualised"
          },
          {
            "name": "NoDeposits"
          },
          {
            "name": "UserWithdrawalsNotEnabled"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "PollCreatedEvent",
      "fields": [
        {
          "name": "pollIndex",
          "type": "u64",
          "index": false
        },
        {
          "name": "address",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "title",
          "type": "string",
          "index": false
        },
        {
          "name": "startTime",
          "type": "string",
          "index": false
        },
        {
          "name": "endTime",
          "type": "string",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "DepositEvent",
      "fields": [
        {
          "name": "pollIndex",
          "type": "u64",
          "index": false
        },
        {
          "name": "address",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "anti",
          "type": "u64",
          "index": false
        },
        {
          "name": "pro",
          "type": "u64",
          "index": false
        },
        {
          "name": "u",
          "type": "u64",
          "index": false
        },
        {
          "name": "s",
          "type": "u64",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "EqualisationEvent",
      "fields": [
        {
          "name": "pollIndex",
          "type": "u64",
          "index": false
        },
        {
          "name": "truth",
          "type": {
            "vec": "u64"
          },
          "index": false
        },
        {
          "name": "anti",
          "type": "u64",
          "index": false
        },
        {
          "name": "pro",
          "type": "u64",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "WithdrawEvent",
      "fields": [
        {
          "name": "pollIndex",
          "type": "u64",
          "index": false
        },
        {
          "name": "address",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "anti",
          "type": "u64",
          "index": false
        },
        {
          "name": "pro",
          "type": "u64",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "PollUpdateEvent",
      "fields": [
        {
          "name": "pollIndex",
          "type": "u64",
          "index": false
        },
        {
          "name": "fieldUpdated",
          "type": "string",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "AdminEvent",
      "fields": [
        {
          "name": "action",
          "type": "string",
          "index": false
        },
        {
          "name": "args",
          "type": {
            "vec": {
              "defined": "KeyValue"
            }
          },
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "Unauthorised",
      "msg": "Unauthorised"
    }
  ]
};
