'use strict'

var app = require('../..')
const request = require('supertest')
// const config = require('../../config/env')
// const tonyJSON = require('../../components/db/seed/data/users.json')

import test from 'ava'

let newUser
let accessToken
let adminAccessToken // i need to store it to return admin, on client side it is stored in localstorage
let agent

test.before('SETTING UP /api/v1/auth ', async function(t) {
	t.plan(2)

	agent = request.agent(app)
	const res = await agent.post('/api/v1/auth/login').send({
		username: 'daton',
		password: 'daton'
	})

	t.is(res.status, 200, 'should signin')
	t.truthy(res.body.accessToken)

	accessToken = res.body.accessToken
	adminAccessToken = res.body.accessToken
})

test('WHOAMI /api/v1/auth/whoami', async function(t) {
	t.plan(4)
	const res = await agent
		.get('/api/v1/auth/whoami')
		.set('Authorization', accessToken)

	t.is(res.status, 200, 'should respond with status 200')
	t.is(res.body.username, 'daton')
	t.is(res.body.tipo, 'Amministratore')
	t.deepEqual(res.body.roles, ['USER', 'ADMIN'])
})

test('AMIADMIN /api/v1/auth/amiadmin', async function(t) {
	t.plan(1)
	const res = await agent
		.get('/api/v1/auth/amiadmin')
		.set('Authorization', accessToken)

	t.is(res.status, 200, 'should respond with status 200')
})

test('CREATE A SCHOOL USER /api/v1/users', async function(t) {
	t.plan(5)
	const res = await agent
		.post('/api/v1/users')
		.set('Authorization', accessToken)
		.send({
			tipo: 'Scuola',
			username: 'nuovoutente',
			password: 'nuovoutente',
			email: 'scuola@scuola.it'
		})

	t.is(res.status, 201, 'should respond with status 201')
	t.is(res.body.username, 'nuovoutente')
	t.is(res.body.tipo, 'Scuola')
	t.truthy(res.body._id)
	newUser = res.body
	t.deepEqual(res.body.roles, ['USER', 'SCHOOL'])
})

test('LOGIN WITH USER /api/v1/auth/admin-login/:id', async function(t) {
	t.plan(3)
	const badRequest = await agent
		.get('/api/v1/auth/admin-login/undefined')
		.set('Authorization', accessToken)

	t.is(badRequest.status, 400, 'should respond with status 400')

	const res = await agent
		.get('/api/v1/auth/admin-login/' + newUser._id)
		.set('Authorization', accessToken)

	t.is(res.status, 200, 'should respond with status 200')
	t.truthy(res.body.accessToken)
	accessToken = res.body.accessToken
})

test('WHOAMI SCUOLA /api/v1/auth/whoami', async function(t) {
	t.plan(4)
	const res = await agent
		.get('/api/v1/auth/whoami')
		.set('Authorization', accessToken)

	t.is(res.status, 200, 'should respond with status 200')
	t.is(res.body.username, 'nuovoutente')
	t.is(res.body.tipo, 'Scuola')
	t.deepEqual(res.body.roles, ['USER', 'SCHOOL'])
})

test('WHOAMI ADMIN /api/v1/auth/whoami', async function(t) {
	t.plan(4)
	const res = await agent
		.get('/api/v1/auth/whoami')
		.set('Authorization', adminAccessToken)

	t.is(res.status, 200, 'should respond with status 200')
	t.is(res.body.username, 'daton')
	t.is(res.body.tipo, 'Amministratore')
	t.deepEqual(res.body.roles, ['USER', 'ADMIN'])
})

test('LOGOUT USER /api/v1/auth/logout', async function(t) {
	t.plan(1)
	const res = await agent
		.get('/api/v1/auth/logout')
		.set('Authorization', accessToken)

	t.is(res.status, 200, 'should respond with status 200')
})

test('DELETE SCHOOL USER /api/v1/users/:id', async function(t) {
	t.plan(2)
	const res = await agent
		.delete('/api/v1/users/' + newUser._id)
		.set('Authorization', adminAccessToken)

	t.is(res.status, 200, 'should respond with 200')

	const notFound = await agent
		.delete('/api/v1/users/' + newUser._id)
		.set('Authorization', adminAccessToken)

	t.is(notFound.status, 404)
})

test('FINALLY', function(t) {
	app.shutdown()
	t.pass()
})
