// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package api4

import (
	"net/http"

	"github.com/mattermost/mattermost/server/public/model"
)

func (api *API) InitBleve() {
	api.BaseRoutes.Bleve.Handle("/purge_indexes", api.APISessionRequired(purgeBleveIndexes)).Methods(http.MethodPost)
}

func purgeBleveIndexes(c *Context, w http.ResponseWriter, r *http.Request) {
	auditRec := c.MakeAuditRecord(model.AuditEventPurgeBleveIndexes, model.AuditStatusFail)
	defer c.LogAuditRec(auditRec)

	if !c.App.SessionHasPermissionToAndNotRestrictedAdmin(*c.AppContext.Session(), model.PermissionPurgeBleveIndexes) {
		c.SetPermissionError(model.PermissionPurgeBleveIndexes)
		return
	}

	if err := c.App.PurgeBleveIndexes(c.AppContext); err != nil {
		c.Err = err
		return
	}

	auditRec.Success()

	ReturnStatusOK(w)
}
