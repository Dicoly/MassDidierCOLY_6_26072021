import { fireEvent, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import userEvent from "@testing-library/user-event"
import { ROUTES} from "../constants/routes.js"


import {setSessionStorage} from "../../setup-jest";
// Session storage - Employee
setSessionStorage('Employee');

const onNavigate = (pathname) => {
  // structure du onNavigate pour le constructeur
  document.body.innerHTML = ROUTES({ pathname })
}

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then it should display NewBill page", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
      const newBillForm = screen.getByTestId('form-new-bill')
      expect(newBillForm).toBeTruthy()
    })

    test("Then I update the justificatif file", () => {
      document.body.innerHTML = NewBillUI();

      const newBill = new NewBill({
        document,
        onNavigate,
        firestore: null,
        localStorage: window.localStorage
      })

      const inputFile = screen.getByTestId("file");
      const handleChangeFile = jest.fn(newBill.handleChangeFile)

      inputFile.addEventListener('change', handleChangeFile)
      fireEvent.change(inputFile, {
        target: {
          files: [new File([''], 'test.jpg', { type: 'image/jpg' })],
        },
      })
      expect(handleChangeFile).toHaveBeenCalled()
      expect(inputFile.files[0].name).toBe("test.jpg")
    })
  })


  describe("When I upload a bad file", () => {
    test("Then It should not upload the file and show an error message", () => {
      document.body.innerHTML = NewBillUI();

      const newBill = new NewBill({
        document,
        onNavigate,
        firestore: null,
        localStorage: window.localStorage
      })

      const inputFile = screen.getByTestId("file");
      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      inputFile.addEventListener('change', handleChangeFile)
      fireEvent.change(inputFile, {
        target: {
          files: [new File([''], 'test.pdf', { type: 'image/pdf' })],
        },
      })
      expect(handleChangeFile).toHaveBeenCalled()
      expect(alert).toBeTruthy()
    })
  })

  //Quand je ne remplis pas les champs et que je clique sur envoyer
  describe('When I do not fill fields and I click on send', () => {
    test('Then it should stay on newBill page', () => {
        document.body.innerHTML = NewBillUI()

        const inputExpenseName = screen.getByTestId('expense-name').value
        expect(inputExpenseName).toBe('')

        const newBillForm = screen.getByTestId('form-new-bill')
        const handleSubmit = jest.fn((e) => e.preventDefault())

        newBillForm.addEventListener('submit', handleSubmit)

        fireEvent.submit(newBillForm)

        expect(newBillForm).toBeTruthy()
    })
  })
  //Quand je remplis correctement les champs
  describe("When I properly fill fields ", () => {
    test("Then it should create a Bill", () => {
        document.body.innerHTML = NewBillUI()

        const inputData = {
            type: 'Transports',
            name: 'Test',
            datepicker: '2021-05-26',
            amount: '100',
            vat: '10',
            pct: '19',
            commentary: 'Test',
            file: new File(['test'], 'test.png', { type: 'image/png' }),
        }

        const inputExpenseName = screen.getByTestId('expense-name')
        const inputExpenseType = screen.getByTestId('expense-type')
        const inputDatepicker = screen.getByTestId('datepicker')
        const inputAmount = screen.getByTestId('amount')
        const inputVAT = screen.getByTestId('vat')
        const inputPCT = screen.getByTestId('pct')
        const inputCommentary = screen.getByTestId('commentary')
        const inputFile = screen.getByTestId('file')

        fireEvent.change(inputExpenseType, {target: { value: inputData.type }})
        expect(inputExpenseType.value).toBe(inputData.type)

        fireEvent.change(inputExpenseName, {target: { value: inputData.name }})
        expect(inputExpenseName.value).toBe(inputData.name)

        fireEvent.change(inputDatepicker, {target: { value: inputData.datepicker }})
        expect(inputDatepicker.value).toBe(inputData.datepicker)

        fireEvent.change(inputAmount, {target: { value: inputData.amount }})
        expect(inputAmount.value).toBe(inputData.amount)

        fireEvent.change(inputVAT, {target: { value: inputData.vat }})
        expect(inputVAT.value).toBe(inputData.vat)

        fireEvent.change(inputPCT, {target: { value: inputData.pct }})
        expect(inputPCT.value).toBe(inputData.pct)

        fireEvent.change(inputCommentary, {target: { value: inputData.commentary }})
        expect(inputCommentary.value).toBe(inputData.commentary)

        userEvent.upload(inputFile, inputData.file)
        expect(inputFile.files[0]).toStrictEqual(inputData.file)
        expect(inputFile.files).toHaveLength(1)
    })
  })
  //test submit newBill
  describe("When I am on NewBill Page and I click on submit button", () => {
    test("Then it should create a new bill and I should be redirected to the dashboard", () => {
      document.body.innerHTML = NewBillUI();
      
			const newBill = new NewBill({
        document,	
        onNavigate,	
        firestore: null,	
        localStorage: window.localStorage
      });

      const handleSubmit = jest.fn(newBill.handleSubmit)
      
      const submitButton = screen.getByTestId('form-new-bill');
			submitButton.addEventListener('submit', handleSubmit);
			fireEvent.submit(submitButton);

			expect(handleSubmit).toHaveBeenCalled();
			expect(screen.getAllByText('Mes notes de frais')).toBeTruthy();
    });
  });
})