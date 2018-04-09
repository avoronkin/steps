const assert = require('assert')
const sinon = require('sinon')
const Steps = require('../lib/steps')

describe('Steps', () => {
    it ('run task', async () => {
        const machine = new Steps({
            startAt: 'hello',
            states: {
                'hello': {
                    type: 'task',
                    handler: function () {
                        return 'world'
                    },
                    end: true,
                }
            }
        })


        const result = await machine.run()
        assert.equal(result, 'world')
    })

    it ('run tasks', async () => {
        const machine = new Steps({
            startAt: 'first',
            states: {
                first: {
                    type: 'task',
                    handler: function () {
                        return 'hello'
                    },
                    next: 'second',
                },
                second: {
                    type: 'task',
                    handler: function (input) {
                        return [input, 'world'].join(' ')
                    },
                }
            }
        })


        const result = await machine.run()
        assert.equal(result, 'hello world')
    })

    it ('run choice', async () => {
        const machine = new Steps({
            startAt: 'first',
            states: {
                first: {
                    type: 'task',
                    handler: function (input) {
                        return input ? `${input} hello` : 'hello'
                    },
                    next: 'choice',
                },
                second: {
                    type: 'task',
                    handler: function (input) {
                        return input ? `${input} world` : 'world'
                    },
                    next: 'choice',
                },
                end: {
                    type: 'pass'
                },
                choice: {
                    type: 'choice',
                    next: function (input) {
                        if (input.length > 20) {
                            return 'end'
                        } else if (input.length < 10) {
                            return 'first'
                        } else {
                            return 'second'
                        }
                    }
                },
            }
        })


        const result = await machine.run()
        assert.equal(result, 'hello hello world world')
    })

    it('run onEnter', async () => {
        const onEnter = sinon.spy()

        const machine = new Steps({
            startAt: 'first',
            states: {
                first: {
                    type: 'task',
                    handler: function () {
                        return 'hello'
                    },
                    next: 'second',
                },
                second: {
                    type: 'task',
                    handler: function (input) {
                        return [input, 'world'].join(' ')
                    },
                }
            },
            onEnter
        })


        const result = await machine.run()

        assert.equal(result, 'hello world')
        assert.equal(onEnter.calledTwice, true)
        assert.deepEqual(onEnter.args, [ [ 'first', undefined ], [ 'second', 'hello' ] ])
    })

    it('run onExit', async () => {
        const onExit = sinon.spy()

        const machine = new Steps({
            startAt: 'first',
            states: {
                first: {
                    type: 'task',
                    handler: function () {
                        return 'hello'
                    },
                    next: 'second',
                },
                second: {
                    type: 'task',
                    handler: function (input) {
                        return [input, 'world'].join(' ')
                    },
                }
            },
            onExit
        })


        const result = await machine.run()

        assert.equal(result, 'hello world')
        assert.equal(onExit.calledTwice, true)
        assert.deepEqual(onExit.args, [ ['first', 'hello'], [ 'second', 'hello world' ] ])
    })
})
