const { json, send } = require('micro')
const moment = require('moment-timezone')
const fetch = require('node-fetch')

const cors = require('micro-cors')({
  allowMethods: ['POST']
})

const _toJSON = error => {
  return !error
    ? ''
    : Object.getOwnPropertyNames(error).reduce(
        (jsonError, key) => {
          return { ...jsonError, [key]: error[key] }
        },
        { type: 'error' }
      )
}

process.on('unhandledRejection', (reason, p) => {
  console.error(
    'Promise unhandledRejection: ',
    p,
    ', reason:',
    JSON.stringify(reason)
  )
})

module.exports = cors(async (req, res) => {
  if (req.method === 'OPTIONS') {
    return send(res, 200, 'ok!')
  }

  /*
  "carrier": "usps",
  "tracking_number": "9205590164917312751089",
  "address_from": {
    "city": "Las Vegas",
    "state": "NV",
    "zip": "89101",
    "country": "US"
  },
  "address_to": {
    "city": "Spotsylvania",
    "state": "VA",
    "zip": "22551",
    "country": "US"
  },
  "transaction": "1275c67d754f45bf9d6e4d7a3e205314",
  "original_eta": "2016-07-23T00:00:00Z",
  "eta": "2016-07-23T00:00:00Z",
  "servicelevel": {
    "token": "usps_priority",
    "name": "Priority Mail"
  },
  "metadata": null,
  "tracking_status": {
    "object_created": "2016-07-23T20:35:26.129Z",
    "object_updated": "2016-07-23T20:35:26.129Z",
    "object_id": "ce48ff3d52a34e91b77aa98370182624",
    "status": "DELIVERED",
    "status_details": "Your shipment has been delivered at the destination mailbox.",
    "status_date": "2016-07-23T13:03:00Z",
    "location": {
      "city": "Spotsylvania",
      "state": "VA",
      "zip": "22551",
      "country": "US"
    }
  },
  */

  try {
    const tracking_update = await json(req)
    const {
      data: {
        carrier,
        tracking_number,
        servicelevel: { name: service_type },
        eta,
        tracking_status: {
          status,
          status_details,
          status_date,
          location: {
            city: location_city,
            state: location_state,
            zip: location_zip
          }
        }
      }
    } = tracking_update

    let tracking_extra = {}
    if (tracking_update.extra) {
      tracking_extra = tracking_update.extra
    }
    let { billing_email, order_id } = tracking_extra
    // if (!order_id) {
    //   order_id = '730589c9-ee68-44b4-a201-bb38a9468abe'
    // }
    // if (!billing_email) {
    //   billing_email = 'adam@uniquelyparticular.com'
    // }

    if (order_id) {
      if (billing_email) {
        const payload = {
          profile: {
            source: 'support',
            identifiers: {
              email: billing_email
            }
          },
          event: {
            source: 'shippo',
            type: 'shipping-status-change',
            description:
              status === 'DELIVERED' ? 'Order Delivered' : 'Shipping Update',
            created_at: moment(status_date),
            properties: {
              'Shipping Carrier': carrier,
              'Tracking Status': status, //TODO: format case
              'Order ID': order_id,
              'Tracking Number': tracking_number,
              'Service Type': service_type,
              'Estimated Delivery': moment(eta).format('MM/DD/YYYY'),
              'Tracking Notes': status_details,
              'Tracking Location': `${location_city}, ${location_state} ${location_zip}`
            }
          }
        }

        fetch(
          `https://${
            process.env.ZENDESK_SUBDOMAIN
          }.zendesk.com/api/sunshine/track`,
          {
            headers: {
              Authorization: `Basic ${Buffer.from(
                `${process.env.ZENDESK_INTEGRATION_EMAIL}/token:${
                  process.env.ZENDESK_INTEGRATION_SECRET
                }`
              ).toString('base64')}`,
              Accept: 'application/json',
              'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(payload)
          }
        )
          .then(response => {
            if (response.ok && response.status < 299) {
              return send(
                res,
                200,
                JSON.stringify({ received: true, order_id })
              )
            } else {
              return send(res, 500, 'Error')
            }
          })
          .catch(error => {
            const jsonError = _toJSON(error)
            return send(res, 500, jsonError)
          })
      } else {
        console.error('missing billing_email')
        return send(res, 200, JSON.stringify({ received: true, order_id }))
      }
    } else {
      console.error('missing order_id')
      return send(
        res,
        200,
        JSON.stringify({ received: true, order_id: 'null' })
      )
    }
  } catch (error) {
    const jsonError = _toJSON(error)
    return send(res, 500, jsonError)
  }
})
