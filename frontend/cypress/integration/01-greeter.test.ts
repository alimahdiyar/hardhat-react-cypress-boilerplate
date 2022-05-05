import {CustomizedBridge, provider, signer} from '../support/commands'

describe('Greeter', () => {

  it('greets', () => {
    const ethBridge =  new CustomizedBridge(signer, provider)
    cy.on('window:before:load', (win) => {
      // @ts-ignore
      win.ethereum =ethBridge
    })
    cy.visit('/')
    cy.get('[data-testid=greeter-message]').contains("Hello")
  })

  it('sets greeting', () => {
    const ethBridge =  new CustomizedBridge(signer, provider)
    cy.on('window:before:load', (win) => {
      // @ts-ignore
      win.ethereum = ethBridge
      cy.spy(ethBridge, 'setGreeting')
    })
    cy.visit('/')
    cy.get('[data-testid=greeter-message]').contains("Hello!")
    cy.get('[data-testid=greeter-input]').type("Greet!")
    cy.get('[data-testid=greeter-set]').click()
    cy.wait(1000)
    cy.window().then((win) => {
      expect(ethBridge.setGreeting).to.have.calledWith(["Greet!"])
    })
  })
})
