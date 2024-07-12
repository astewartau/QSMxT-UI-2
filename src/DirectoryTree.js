import React from 'react';

const DirectoryTree = ({ structure, onFileClick }) => {
  if (!structure) return null;

  const renderTree = (node) => {
    if (node.type === 'folder') {
      return (
        <li key={node.path}>
          <span>{node.name}</span>
          <ul>
            {node.children.map(child => renderTree(child))}
          </ul>
        </li>
      );
    }

    return (
      <li key={node.path} onClick={() => onFileClick(node.path)}>
        <span>{node.name}</span>
      </li>
    );
  };

  return (
    <ul>
      {renderTree(structure)}
    </ul>
  );
};

export default DirectoryTree;
