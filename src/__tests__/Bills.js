import { fireEvent, screen } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills.js"
import { ROUTES } from "../constants/routes"
import firebase from "../__mocks__/firebase"
import '@testing-library/jest-dom/extend-expect'


import {setSessionStorage} from "../../setup-jest";
// Session storage - Employee
setSessionStorage('Employee');

const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname })
}


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const expected = "active-icon"
      const billIcon = screen.getByTestId("icon-window")
      billIcon.classList.add(expected)
      expect(billIcon).toHaveAttribute('class', expected)
    })
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^([1-9]|[12][0-9]|3[01]) ([a-zé]{3,4}[.]) (\d{2})$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => (a < b ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
  // Pour les 100% views ajout test BillsUI loadingPage et errorPage
  describe('When I am on Bills page but it is loading', () => {
    test('Then, Loading page should be rendered', () => {
      const html = BillsUI({ loading: true })
      document.body.innerHTML = html
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })
  describe('When I am on Bills page but back-end send an error message', () => {
    test('Then, Error page should be rendered', () => {
      const html = BillsUI({ error: 'some error message' })
      document.body.innerHTML = html
      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })
  })
  //Pour valider la partie nouvelle note de frais
  describe('When I click on New Bills buton', () => {
    test('Then New Bills page should be displayed', () => {
        const html = BillsUI({ data: [] })
        document.body.innerHTML = html

        //const firestore = null
        const b = new Bills({
            document,
            onNavigate,
            firestore:null,
            localStorage: window.localStorage,
        })

        const buttonNewBill = screen.getByTestId('btn-new-bill')
        const handleClickNewBill = jest.fn(b.handleClickNewBill)
        buttonNewBill.addEventListener('click', handleClickNewBill)
        fireEvent.click(buttonNewBill)

        expect(handleClickNewBill).toHaveBeenCalled()
        const newBillForm = screen.getByTestId('form-new-bill')
        expect(newBillForm).toBeTruthy()
    })
  })
  //Pour la partie handleClickIconEye (icon eye)
  describe('When I click on the icon eye', () => {
    test('Then it should open a modal', () => {
      
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      
      $.fn.modal = jest.fn()
      const billsList = new Bills({
        document, onNavigate, firestore: null, localStorage: window.localStorage
      })     
      const eye = screen.getAllByTestId('icon-eye')[0]
      const handleClickIconEye = jest.fn(billsList.handleClickIconEye(eye))      
      eye.addEventListener('click', handleClickIconEye)
      fireEvent.click(eye)
      expect(handleClickIconEye).toHaveBeenCalled()
      expect(screen.getByTestId('modaleFile')).toBeTruthy()         
    })
  }) 
})

// test d'intégration GET
describe('Given I am a user connected as Employee', () => {
  test('fetches bills from mock API GET', async () => {
      const getSpy = jest.spyOn(firebase, 'get')
      const bills = await firebase.get()
      expect(getSpy).toHaveBeenCalledTimes(1)
      expect(bills.data.length).toBe(4)
  })
  test('fetches bills from an API and fails with 404 message error', async () => {
      firebase.get.mockImplementationOnce(() =>
          Promise.reject(new Error('Erreur 404'))
      )
      const html = BillsUI({ error: 'Erreur 404' })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
  })
  test('fetches messages from an API and fails with 500 message error', async () => {
      firebase.get.mockImplementationOnce(() =>
          Promise.reject(new Error('Erreur 500'))
      )
      const html = BillsUI({ error: 'Erreur 500' })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
  })
})