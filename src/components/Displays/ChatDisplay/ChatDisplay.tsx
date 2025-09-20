import React, { useState } from "react";
import ChatWindow from "../../ChatWindow/ChatWindow";
import styles from "./ChatDisplay.module.css";

interface Company {
  _id: string;
  name: string;
  description: string;
  location: string;
  email: string;
  phone: string;
}

interface ChatDisplaysProps {
  companies: Company[];
  companyId: string;
}

const ChatDisplays: React.FC<ChatDisplaysProps> = ({ companies, companyId }) => {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
const getSelectedUserId = (company: Company) => {
    return company._id;
  };
  return (
    <div className={styles.chatDisplaysContainer}>
      {!selectedCompany ? (
        <table className={styles.companiesTable}>
          <thead>
            <tr>
              <th>Id</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr
                key={company._id}
                onClick={() => { 
                  setSelectedCompany(company);
                  const userId = getSelectedUserId(company);
                  console.log("Usuario seleccionado, id:", userId);
                }}
              >
                <td>{company._id}</td>
                <td>{company.name}</td>
                <td>{company.email}</td>
                <td>{company.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <>
          <button className={styles.backButton} onClick={() => setSelectedCompany(null)}>
            ← Volver
          </button>
          <ChatWindow
            companyId={companyId}
            companyName={selectedCompany.name}
            userId={getSelectedUserId(selectedCompany)}
            senderId ={companyId}
            receiverId={getSelectedUserId(selectedCompany)}
            
          />
        </>
      )}
    </div>
  );
};

export default ChatDisplays;