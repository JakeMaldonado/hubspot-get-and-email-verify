'use strict';
const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');

let hubspotBaseUrl = 'https://api.hubapi.com';
let hunterBaseUrl = 'https://api.hunter.io';

let port = process.env.PORT || 3000;

const app = express();

//HUBSPOT

let contactFirstName = async (email) => {
  try {
    let response = await axios(`${hubspotBaseUrl}/contacts/v1/contact/email/${email}/profile?hapikey=${process.env.HUBKEY}`);
    return response.data.properties.firstname.value;
  } catch (e) {
    // console.log(e);
    return "error";
  }
};

let deleteContact = async (email) => {
  try {
    let contactRes = await axios(`${hubspotBaseUrl}/contacts/v1/contact/email/${email}/profile?hapikey=${process.env.HUBKEY}`);
    let response = axios.delete(`${hubspotBaseUrl}/contacts/v1/contact/vid/${contactRes.data.vid}?hapikey=${process.env.HUBKEY}`);
    return "deleted";
  } catch (e) {
    return "error";
  }
};

let verifyEmail = async (email) => {
  try {
    let res = await axios(`${hunterBaseUrl}/v2/email-verifier?email=${email}&api_key=${process.env.HUNTERKEY}`);
    if (!res.data.data.result == 'deliverable' && !res.data.data.result == 'risky') {
      deleteContact(email);
    }
    return (res.data.data.result == 'deliverable' || res.data.data.result == 'risky') ? true : false;
  } catch (e) {
    return e;
  }
};

let checkContacted = async (email) => {
  try {
    let res = await axios(`${hubspotBaseUrl}/contacts/v1/contact/email/${email}/profile?hapikey=${process.env.HUBKEY}`);
    let result = res.data.properties.num_contacted_notes.versions;
    if (result.length > 0) {
      let recentContact = result[0].timestamp;
      return recentContact > (Date.now() - 259200000) ? true : false; // subtacting followup time from current time
    }
    return false;
  } catch (e) {
    console.log(e);
    return e;
  }
};

//SERVER

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/firstname', async (req, res) => {
  try {
    let data = await contactFirstName(req.body.email);
    res.send(data);
  } catch (e) {
    res.send({
      "error": "something went wrong"
    })
  }
});

app.post('/firstverify', async (req, res) => {
  try {
    let data = await contactFirstName(req.body.email);
    let isValid = await verifyEmail(req.body.email);
    let toSend = isValid ? data : 'undeliverable';
    res.send(toSend);
  } catch (e) {
    res.send({
      "error": "something went wrong"
    })
  }
});

app.post('/contacted', async (req, res) => {
  try {
    let isContacted = await checkContacted(req.body.email);
    console.log(isContacted);
    res.send(isContacted);
  } catch (e) {
    console.log(e);
    res.send({
      "error": "something went wrong"
    });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port: ${port}`);
});
