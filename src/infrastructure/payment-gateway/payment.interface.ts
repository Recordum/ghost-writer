interface IPayment {
  pay(): void;
  cancel(): void;
  refund(): void;
}
