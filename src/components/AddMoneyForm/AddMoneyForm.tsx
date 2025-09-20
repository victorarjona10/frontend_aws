import React, { useState } from 'react';
import styles from './AddMoneyForm.module.css';
import { addMoneyToWallet } from '../../service/userService';
interface AddMoneyFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddMoneyForm: React.FC<AddMoneyFormProps> = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    cardNumber: '',
    cardHolder: '',
    expiry: '',
    cvv: '',
    amount: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    try {
      const userId = localStorage.getItem('userId');
      if (!userId) throw new Error('No user ID found');
      await addMoneyToWallet(userId, Number(form.amount));
      onSuccess(); // Notifica al padre para refrescar el wallet si quieres
      onClose();
    } catch (error) {
      alert('Error adding money to wallet');
      setSubmitted(false);
    }
  };
  return (
    <div className={styles.overlay}>
      <div className={styles.formContainer}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        <h2 className={styles.title}>Add Money to Wallet</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label>
            Card Number
            <input
              type="text"
              name="cardNumber"
              maxLength={19}
              placeholder="1234 5678 9012 3456"
              value={form.cardNumber}
              onChange={handleChange}
              required
              pattern="\d{4} \d{4} \d{4} \d{4}"
            />
          </label>
          <label>
            Cardholder Name
            <input
              type="text"
              name="cardHolder"
              placeholder="John Doe"
              value={form.cardHolder}
              onChange={handleChange}
              required
            />
          </label>
          <div className={styles.row}>
            <label>
              Expiry Date
              <input
                type="text"
                name="expiry"
                maxLength={5}
                placeholder="MM/YY"
                value={form.expiry}
                onChange={handleChange}
                required
                pattern="\d{2}/\d{2}"
              />
            </label>
            <label>
              CVV
              <input
                type="password"
                name="cvv"
                maxLength={4}
                placeholder="123"
                value={form.cvv}
                onChange={handleChange}
                required
                pattern="\d{3,4}"
              />
            </label>
          </div>
          <label>
            Amount
            <input
              type="number"
              name="amount"
              min={1}
              step="any"
              placeholder="Amount in €"
              value={form.amount}
              onChange={handleChange}
              required
            />
          </label>
          <button className={styles.submitButton} type="submit">
            {submitted ? 'Processing...' : 'Add Money'}
          </button>
          {submitted && (
            <div className={styles.successMessage}>
              Money added successfully!
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddMoneyForm;
