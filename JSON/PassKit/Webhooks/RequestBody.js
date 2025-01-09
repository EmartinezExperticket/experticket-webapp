const requestBody = {
	// The webhook event type, one of the below: 
	// PASS_EVENT_RECORD_CREATED
	// PASS_EVENT_INSTALLED
	// PASS_EVENT_RECORD_UPDATED
	// PASS_EVENT_RECORD_UPDATED
	"event": "PASS_EVENT_RECORD_UPDATED",
	// The pass record details
	"pass": {
		// The unique 22 character PassKit ID.
		"id": "5u5EO18473CDVG0Vw0VgPV",
		// The id of the project which the pass belongs to.
		"classId": "24hmYozRggBJTtPt0Y2e3X",
		// The protocol, which signifies the project type.
		// For a list of possible ENUM values see below.
		"protocol": 100,
		// PII data of the pass holder. Full object details can be found in our member -or coupon documentation in the 'person' object:
		// https://docs.passkit.io/protocols/member/#operation/Members_enrolMember 
		"personDetails": {
			"displayName": "Patrick Kosterman",
			"emailAddress": "patrick@passkit.com"
			//...
		},
		// All the system generated pass meta data. Full object details can be found in our member -or coupon documentation in the 'metaData' object:
		// For a list of possible ENUM values in this object see below.
		"metaData": {
			"status": 1,
			"lifecycleEvents": [1, 2],
			"utm": {},
			"altId": "5u5EO18473CDVG0Vw0VgPV",
			"issueIpAddress": "92.237.10.176"
			//...
		},
		// Holds protocol specific data for the pass record (e.g. tier points for Membership protocol, flight number for flight protocol)
		"recordData": {
			"members.member.externalId": "ABC123",
			"members.member.id": "5u5EO18473CDVG0Vw0VgPV",
			"members.member.points": "100.000000"
			//...
		}
	}
}