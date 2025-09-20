import React from 'react';
import styles from '../MainPages/NavBar_Services/NavBar_Services.module.css';

interface FollowedCompany {
  company_id: string;
  _id: string;
}

interface Company {
  _id: string;
  name: string;
  description: string;
  location: string;
  email: string;
  phone: string;
}

interface Props {
  allCompanies: Company[];
  currentUser: { company_Followed: FollowedCompany[] };
  handleFollowToggle: (companyId: string) => void;
}

const Company_Table_View: React.FC<Props> = ({
  allCompanies,
  currentUser,
  handleFollowToggle,
}) => {
  if (!allCompanies.length) {
    return <p>No companies found. Please try again later.</p>;
  }

  return (
    <div className={styles.companiesTableWrapper}>
      <table className={styles.companiesTable}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Ubicación</th>
            <th>Correo Electrónico</th>
            <th>Teléfono</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {allCompanies.map((company) => (
            <tr key={company._id}>
              <td>{company.name}</td>
              <td className={styles.descriptionCell}>
                {company.description.length > 50
                  ? `${company.description.substring(0, 50)}...`
                  : company.description}
              </td>
              <td>{company.location}</td>
              <td>{company.email}</td>
              <td>{company.phone}</td>
              <td className={styles.centerButtonCell}>
                <button
                  className={`${styles.actionButton} ${
                    currentUser.company_Followed?.some(
                      (followed) => followed.company_id === company._id,
                    )
                      ? styles.unfollowButton
                      : styles.followButton
                  }`}
                  onClick={() => handleFollowToggle(company._id)}>
                  {currentUser.company_Followed?.some(
                    (followed) => followed.company_id === company._id,
                  )
                    ? 'Dejar de seguir'
                    : 'Seguir'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Company_Table_View;
