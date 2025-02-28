import { AssetRepositoryOnboardingSkill } from "../../../src/services/onboarding/AssetRepositoryOnboardingSkill";
import { MessageDispatcher } from "../../../src/messaging/MessageDispatcher";
import { IMessageSender } from "../../../src/services/onboarding/messaginginterface/IMessageSender";
import { WebClient } from "../../../src/web/WebClient";
import { SimpleMongoDbClient } from "../../../src/persistence/SimpleMongoDbClient";
import sinon from "sinon";
import { MessageInterpreter } from "../../../src/messaging/MessageInterpreter";
import { AmqpClient } from "../../../src/messaging/AmqpClient";
import { ConsumeMessage } from "amqplib";
import { InteractionMessage } from "i40-aas-objects";
import { logger } from "../../../src/log";
import { Subscription } from "../../../src/services/onboarding/messaginginterface/Subscription";

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

// Then either:
var expect = chai.expect;
// or:
//var assert = chai.assert;
// or:
chai.should();

function makeDbClient() {
  return new SimpleMongoDbClient("tests", "", "", "");
}

function makeFakeDbClient() {
  let dbClient = makeDbClient();

  let fakeStoreInDb = sinon.fake.resolves({ result: "ok" });
  sinon.replace(dbClient, "connect", sinon.fake.resolves({}));
  sinon.replace(dbClient, "disconnect", sinon.fake.resolves({}));
  sinon.replace(dbClient, "update", fakeStoreInDb);
  sinon.replace(dbClient, "getOneByKey", sinon.fake.returns(null));
  return dbClient;
}

function mockSetup() {}

describe("validation process", function() {
  before(() => {});
  after(() => {});
  beforeEach(async () => {});

  afterEach(async () => {
    sinon.restore();
  });

  it("sends a notUnderstood if the message lacks a message type", async function() {
    let message = <InteractionMessage>{
      frame: {
        type: "",
        messageId: "messageId",
        receiver: {
          identification: {
            id: "receiver-id",
            idType: "idType"
          },
          role: {
            name: "central-asset-repository"
          }
        },
        semanticProtocol: "semprot",
        sender: {
          identification: {
            id: "sender-id",
            idType: "idType"
          },
          role: {
            name: "sender"
          }
        },
        conversationId: "conversationId"
      },
      interactionElements: [{}]
    };
    let messageDispatcher: MessageDispatcher = new MessageDispatcher(
      <IMessageSender>{},
      <WebClient>{},
      "data-manager"
    );

    let fakeReplyNotUnderstood = sinon.fake();
    sinon.replace(
      messageDispatcher,
      "replyNotUnderstood",
      fakeReplyNotUnderstood
    );
    let skill: AssetRepositoryOnboardingSkill = new AssetRepositoryOnboardingSkill(
      messageDispatcher,
      makeFakeDbClient()
    );
    let messageInterpreter: MessageInterpreter = new MessageInterpreter(
      skill,
      new AmqpClient("a", "b", "c", "d", "")
    );
    messageInterpreter.receive(JSON.stringify(message));
    sinon.assert.calledOnce(fakeReplyNotUnderstood);
  });

  it("forwards the event to the state machine if it is parsable and contains senderid, sender role, message type, and conversation Id", async function() {
    let message = <InteractionMessage>{
      frame: {
        type: "publishInstance",
        messageId: "messageId",
        receiver: {
          identification: {
            id: "receiver-id",
            idType: "idType"
          },
          role: {
            name: "central-asset-repository"
          }
        },
        semanticProtocol: "semprot",
        sender: {
          identification: {
            id: "sender-id",
            idType: "idType"
          },
          role: {
            name: "operator"
          }
        },
        conversationId: "conversationId"
      },
      interactionElements: [{}]
    };
    let messageDispatcher: MessageDispatcher = new MessageDispatcher(
      <IMessageSender>{},
      <WebClient>{},
      "data-manager"
    );

    let skill: AssetRepositoryOnboardingSkill = new AssetRepositoryOnboardingSkill(
      messageDispatcher,
      makeFakeDbClient()
    );

    let fakeapplyEvent = sinon.fake();
    sinon.replace(skill, "applyEvent", fakeapplyEvent);

    let messageInterpreter: MessageInterpreter = new MessageInterpreter(
      skill,
      new AmqpClient("a", "b", "c", "d", "")
    );
    messageInterpreter.receive(JSON.stringify(message));
    sinon.assert.calledOnce(fakeapplyEvent);
  });

  it("forwards the event to the state machine if sender role but sender id is empty", async function() {
    let message = <InteractionMessage>{
      frame: {
        type: "publishInstance",
        messageId: "messageId",
        receiver: {
          identification: {
            id: "receiver-id",
            idType: "idType"
          },
          role: {
            name: "central-asset-repository"
          }
        },
        semanticProtocol: "semprot",
        sender: {
          identification: {
            id: "",
            idType: "idType"
          },
          role: {
            name: "operator"
          }
        },
        conversationId: "conversationId"
      },
      interactionElements: [{}]
    };
    let messageDispatcher: MessageDispatcher = new MessageDispatcher(
      <IMessageSender>{},
      <WebClient>{},
      "data-manager"
    );

    let skill: AssetRepositoryOnboardingSkill = new AssetRepositoryOnboardingSkill(
      messageDispatcher,
      makeFakeDbClient()
    );

    let fakeapplyEvent = sinon.fake();
    sinon.replace(skill, "applyEvent", fakeapplyEvent);

    let messageInterpreter: MessageInterpreter = new MessageInterpreter(
      skill,
      new AmqpClient("a", "b", "c", "d", "")
    );
    messageInterpreter.receive(JSON.stringify(message));
    sinon.assert.calledOnce(fakeapplyEvent);
  });
  it("forwards the event to the state machine if sender role but sender id is not given", async function() {
    let message = <InteractionMessage>{
      frame: {
        type: "publishInstance",
        messageId: "messageId",
        receiver: {
          identification: {
            id: "receiver-id",
            idType: "idType"
          },
          role: {
            name: "central-asset-repository"
          }
        },
        semanticProtocol: "semprot",
        sender: {
          identification: {
            idType: "idType"
          },
          role: {
            name: "operator"
          }
        },
        conversationId: "conversationId"
      },
      interactionElements: [{}]
    };
    let messageDispatcher: MessageDispatcher = new MessageDispatcher(
      <IMessageSender>{},
      <WebClient>{},
      "data-manager"
    );

    let skill: AssetRepositoryOnboardingSkill = new AssetRepositoryOnboardingSkill(
      messageDispatcher,
      makeFakeDbClient()
    );

    let fakeapplyEvent = sinon.fake();
    sinon.replace(skill, "applyEvent", fakeapplyEvent);

    let messageInterpreter: MessageInterpreter = new MessageInterpreter(
      skill,
      new AmqpClient("a", "b", "c", "d", "")
    );
    messageInterpreter.receive(JSON.stringify(message));
    sinon.assert.calledOnce(fakeapplyEvent);
  });

  it("sends back a notUnderstood if sender role is an empty string", async function() {
    let message = <InteractionMessage>{
      frame: {
        type: "publishInstance",
        messageId: "messageId",
        receiver: {
          identification: {
            id: "receiver-id",
            idType: "idType"
          },
          role: {
            name: "central-asset-repository"
          }
        },
        semanticProtocol: "semprot",
        sender: {
          identification: {
            id: "sender-id",
            idType: "idType"
          },
          role: {
            name: ""
          }
        },
        conversationId: "conversationId"
      },
      interactionElements: [{}]
    };
    let messageDispatcher: MessageDispatcher = new MessageDispatcher(
      <IMessageSender>{},
      <WebClient>{},
      "data-manager"
    );

    let fakeReplyNotUnderstood = sinon.fake();
    sinon.replace(
      messageDispatcher,
      "replyNotUnderstood",
      fakeReplyNotUnderstood
    );
    let skill: AssetRepositoryOnboardingSkill = new AssetRepositoryOnboardingSkill(
      messageDispatcher,
      makeFakeDbClient()
    );
    let messageInterpreter: MessageInterpreter = new MessageInterpreter(
      skill,
      new AmqpClient("a", "b", "c", "d", "")
    );
    messageInterpreter.receive(JSON.stringify(message));
    sinon.assert.calledOnce(fakeReplyNotUnderstood);
  });

  it("sends back a notUnderstood if conversation Id is an empty string", async function() {
    let message = <InteractionMessage>{
      frame: {
        type: "publishInstance",
        messageId: "messageId",
        receiver: {
          identification: {
            id: "receiver-id",
            idType: "idType"
          },
          role: {
            name: "central-asset-repository"
          }
        },
        semanticProtocol: "semprot",
        sender: {
          identification: {
            id: "sender-id",
            idType: "idType"
          },
          role: {
            name: "sender-role"
          }
        },
        conversationId: ""
      },
      interactionElements: [{}]
    };
    let messageDispatcher: MessageDispatcher = new MessageDispatcher(
      <IMessageSender>{},
      <WebClient>{},
      "data-manager"
    );

    let fakeReplyNotUnderstood = sinon.fake();
    sinon.replace(
      messageDispatcher,
      "replyNotUnderstood",
      fakeReplyNotUnderstood
    );
    let skill: AssetRepositoryOnboardingSkill = new AssetRepositoryOnboardingSkill(
      messageDispatcher,
      makeFakeDbClient()
    );
    let messageInterpreter: MessageInterpreter = new MessageInterpreter(
      skill,
      new AmqpClient("a", "b", "c", "d", "")
    );
    messageInterpreter.receive(JSON.stringify(message));
    sinon.assert.calledOnce(fakeReplyNotUnderstood);
  });

  it("sends back a notUnderstood if conversation Id field is missing", async function() {
    let message = <InteractionMessage>{
      frame: {
        type: "publishInstance",
        messageId: "messageId",
        receiver: {
          identification: {
            id: "receiver-id",
            idType: "idType"
          },
          role: {
            name: "central-asset-repository"
          }
        },
        semanticProtocol: "semprot",
        sender: {
          identification: {
            id: "sender-id",
            idType: "idType"
          },
          role: {
            name: "sender-role"
          }
        }
      },
      interactionElements: [{}]
    };
    let messageDispatcher: MessageDispatcher = new MessageDispatcher(
      <IMessageSender>{},
      <WebClient>{},
      "data-manager"
    );

    let fakeReplyNotUnderstood = sinon.fake();
    sinon.replace(
      messageDispatcher,
      "replyNotUnderstood",
      fakeReplyNotUnderstood
    );
    let skill: AssetRepositoryOnboardingSkill = new AssetRepositoryOnboardingSkill(
      messageDispatcher,
      makeFakeDbClient()
    );
    let messageInterpreter: MessageInterpreter = new MessageInterpreter(
      skill,
      new AmqpClient("a", "b", "c", "d", "")
    );
    messageInterpreter.receive(JSON.stringify(message));
    sinon.assert.calledOnce(fakeReplyNotUnderstood);
  });

  it("sends back an error if there is a null pointer while validating content", async function() {
    let message = <InteractionMessage>{
      frame: {
        type: "publishInstance",
        messageId: "messageId",
        receiver: {
          identification: {
            id: "receiver-id",
            idType: "idType"
          },
          role: {
            name: "central-asset-repository"
          }
        },
        semanticProtocol: "semprot",
        sender: {
          identification: {
            id: "sender-id",
            idType: "idType"
          }
        },
        conversationId: "conversationId"
      },
      interactionElements: [{}]
    };
    let messageDispatcher: MessageDispatcher = new MessageDispatcher(
      <IMessageSender>{},
      <WebClient>{},
      "data-manager"
    );

    let fakeReplyError = sinon.fake();
    sinon.replace(messageDispatcher, "replyError", fakeReplyError);
    let skill: AssetRepositoryOnboardingSkill = new AssetRepositoryOnboardingSkill(
      messageDispatcher,
      makeFakeDbClient()
    );
    let messageInterpreter: MessageInterpreter = new MessageInterpreter(
      skill,
      new AmqpClient("a", "b", "c", "d", "")
    );
    messageInterpreter.receive(JSON.stringify(message));
    sinon.assert.calledOnce(fakeReplyError);
  });

  it("handles the situation where the sender cannot be determined due to a null pointer exception", async function() {
    let message = <InteractionMessage>{
      frame: {
        type: "publishInstance",
        messageId: "messageId",
        receiver: {
          identification: {
            id: "receiver-id",
            idType: "idType"
          },
          role: {
            name: "central-asset-repository"
          }
        },
        semanticProtocol: "semprot",

        conversationId: "conversationId"
      },
      interactionElements: [{}]
    };
    let messageDispatcher: MessageDispatcher = new MessageDispatcher(
      <IMessageSender>{},
      <WebClient>{},
      "data-manager"
    );

    let fakeReplyError = sinon.fake();
    sinon.replace(messageDispatcher, "replyError", fakeReplyError);
    let skill: AssetRepositoryOnboardingSkill = new AssetRepositoryOnboardingSkill(
      messageDispatcher,
      makeFakeDbClient()
    );
    let messageInterpreter: MessageInterpreter = new MessageInterpreter(
      skill,
      new AmqpClient("a", "b", "c", "d", "")
    );
    let spy = sinon.spy(logger, "error");
    messageInterpreter.receive(JSON.stringify(message));
    sinon.assert.notCalled(fakeReplyError);
    sinon.assert.called(spy);
  });

  it("handles the situation where the sender id and role are missing", async function() {
    let message = <InteractionMessage>{
      frame: {
        type: "publishInstance",
        messageId: "messageId",
        receiver: {
          identification: {
            id: "receiver-id",
            idType: "idType"
          },
          role: {
            name: "central-asset-repository"
          }
        },
        semanticProtocol: "semprot",
        sender: {
          identification: {
            idType: "idType"
          }
        },
        conversationId: "conversationId"
      },
      interactionElements: [{}]
    };
    let messageDispatcher: MessageDispatcher = new MessageDispatcher(
      <IMessageSender>{},
      <WebClient>{},
      "data-manager"
    );

    let fakeReplyError = sinon.fake();
    sinon.replace(messageDispatcher, "replyError", fakeReplyError);
    let skill: AssetRepositoryOnboardingSkill = new AssetRepositoryOnboardingSkill(
      messageDispatcher,
      makeFakeDbClient()
    );
    let messageInterpreter: MessageInterpreter = new MessageInterpreter(
      skill,
      new AmqpClient("a", "b", "c", "d", "")
    );
    let spy = sinon.spy(logger, "error");
    messageInterpreter.receive(JSON.stringify(message));
    sinon.assert.notCalled(fakeReplyError);
    sinon.assert.called(spy);
  });

  it("sets up a subscription and starts listening", async function() {
    let messageDispatcher: MessageDispatcher = new MessageDispatcher(
      <IMessageSender>{},
      <WebClient>{},
      "data-manager"
    );

    let skill: AssetRepositoryOnboardingSkill = new AssetRepositoryOnboardingSkill(
      messageDispatcher,
      makeFakeDbClient()
    );

    let fakeapplyEvent = sinon.fake();
    sinon.replace(skill, "applyEvent", fakeapplyEvent);

    let amqpClient = new AmqpClient("a", "b", "c", "d", "");
    let messageInterpreter: MessageInterpreter = new MessageInterpreter(
      skill,
      amqpClient
    );

    let fakeAddSubscriptionData = sinon.fake();
    let fakeStartListening = sinon.fake();

    sinon.replace(amqpClient, "addSubscriptionData", fakeAddSubscriptionData);
    sinon.replace(amqpClient, "startListening", fakeStartListening);
    messageInterpreter.start("x");
    sinon.assert.calledWith(
      fakeAddSubscriptionData,
      sinon.match.has("topic", "x")
    );
    sinon.assert.calledOnce(fakeStartListening);
  });
});
