import React from 'react';
import { useTable } from 'react-table'; // Import the useTable hook

const renderValue = (value) => {
  if (typeof value === 'object' && value !== null) {
    return <pre>{JSON.stringify(value, null, 2)}</pre>;
  }
  return value.toString();
};

const TableComponent = ({ jsonData }) => {
  const data = React.useMemo(
    () => Object.entries(jsonData).map(([key, value]) => ({ key, value })),
    [jsonData]
  );

  const columns = React.useMemo(
    () => [
      {
        Header: 'Key',
        accessor: 'key',
      },
      {
        Header: 'Value',
        accessor: 'value',
        Cell: ({ cell: { value } }) => renderValue(value),
      },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data });

  return (
    <table {...getTableProps()} style={{ border: 'solid 1px blue', width: '100%', textAlign: 'left' }}>
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th {...column.getHeaderProps()} style={{ borderBottom: 'solid 3px red', background: 'aliceblue', color: 'black', fontWeight: 'bold' }}>
                {column.render('Header')}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map(row => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map(cell => (
                <td {...cell.getCellProps()} style={{ padding: '10px', border: 'solid 1px gray', background: 'papayawhip' }}>
                  {cell.render('Cell')}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default TableComponent;
