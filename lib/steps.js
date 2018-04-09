module.exports = class Steps {
    constructor ({startAt, states, onEnter, onExit}){
        this.states = states
        this.startAt = startAt
        this.onEnter = onEnter || function () {}
        this.onExit = onExit || function () {}
    }

    async run (input) {
        return this.next(this.startAt, input)
    }


    async next (stateName, input) {
        const state = this.states[stateName]

        await this.onEnter(stateName, input)

        const output = state.handler ? await state.handler(input) : input

        if (state.next) {
            if (typeof state.next === 'function') {
                const stateName = await state.next(output)

                await this.onExit(stateName, output)

                return this.next(stateName, output)
            } else {

                await this.onExit(stateName, output)

                return this.next(state.next, output)
            }
        }

        await this.onExit(stateName, output)

        return output
    }
}
