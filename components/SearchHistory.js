import React from 'react';

const SearchHistory = ({ history, onSelect }) => {
  if (history.length === 0) return null;

  return (
    <div className="search-history">
      <h3>История поиска:</h3>
      <ul>
        {history.map((item, index) => (
          <li key={index} onClick={() => onSelect(item)}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchHistory;