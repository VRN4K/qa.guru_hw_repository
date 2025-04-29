export default {
    newToDoPayload: (title, doneStatus, description) => {
        return {
            "title": `${title}`,
            "doneStatus": Boolean(doneStatus),
            "description": `${description}`
        }
    },newToDoPayloadXml: (title, doneStatus, description) => {
        return `<doneStatus>${doneStatus}</doneStatus><description>${description}</description><title>${title}</title>`
    },
    wrongToDoStatusPayload: (title, doneStatus, description) => {
        return {
            "title": `${title}`,
            "doneStatus": doneStatus,
            "description": `${description}`
        }
    },
    unrecognisedFieldPayload: (title, doneStatus, description) => {
        return {
            "title": `${title}`,
            "doneStatus": doneStatus,
            "description": `${description}`,
            "author": "vrnk"
        }
    },
    updatePayload: (id, title, doneStatus, description) => {
        return {
            "id": Number(id),
            "title": `${title}`,
            "doneStatus": Boolean(doneStatus),
            "description": `${description}`,
        }
    },
    updateDescriptionPayload: (description) => {
        return {
            "description": `${description}`
        }
    },
    updateDoneStatusPayload: (doneStatus) => {
        return {
            "doneStatus": Boolean(doneStatus)
        }
    },
    updateTitlePayload: (title) => {
        return {
            "title": `${title}`
        }
    },
    updateNoTitlePayload: (doneStatus,description) => {
        return {
            "doneStatus": Boolean(doneStatus),
            "description": `${description}`
        }
    }
}