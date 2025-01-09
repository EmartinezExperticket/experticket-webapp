/*
Endpoint for configuring webhooks is:

POST OR PUT https://api.pub1.passkit.io/integrations/sink

To get, update or delete Membership webhook:

GET or DELETE https://api.pub1.passkit.io/integrations/sink/MEMBERSHIP/{webhook_id} 

To get, update or delete Coupon webhook:

GET or DELETE https://api.pub1.passkit.io/integrations/sink/SINGLE_USE_COUPON/{webhook_id} 

Payload example (for POST and PUT)

*/

const setupRequest = {

   // Webhook id required at PUT call.
   "id": "6MAyTmvzoJuV3tsRmHFM8U",
   
   // Member program id or Coupon campaign id.
   "classId": "3wiJKeMm5wD6ZrFqjuX4rL",
   
   // Please set MEMBERSHIP or SINGLE_USE_COUPON.
   "protocol": "SINGLE_USE_COUPON",
   
   // Available passEventId are PASS_EVENT_RECORD_CREATED, PASS_EVENT_INSTALLED, PASS_EVENT_RECORD_UPDATED, PASS_EVENT_UNINSTALLED, PASS_EVENT_INVALIDATED, PASS_EVENT_RECORD_DELETED
   "passEventId": ["PASS_EVENT_RECORD_CREATED"],
   
   "status": "INTEGRATION_ACTIVE",
   
   "configType": "WEBHOOK",
   
   // Please set the destination URL with stringify JSON
   "configuration": "   {\"targetUrl\":\"https://yourwebhookurl/y4rsldy5\"}"
}