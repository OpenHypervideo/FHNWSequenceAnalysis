var monochromaticColorPalette = ["f1f4fb","ebeef5","e1e4ec","d6d9e2","babec9","acb1bd","9ea4b1","9096a4","898f9e","828897"];

var sequenceDefinitions = [
  {
    sequenceNumber: 1,
    sequenceColor: '#f6c143',
    sequenceLabel: 'Search and add',
  },
  {
    sequenceNumber: 2,
    sequenceColor: '#6899d0',
    sequenceLabel: 'Search and modify',
  },
  {
    sequenceNumber: 3,
    sequenceColor: '#df8244',
    sequenceLabel: 'Find and add',
  },
  {
    sequenceNumber: 4,
    sequenceColor: '#7eac55',
    sequenceLabel: 'Find and modify',
  },
  {
    sequenceNumber: 5,
    sequenceColor: '#d0cece',
    sequenceLabel: 'Search and navigate',
  },
  {
    sequenceNumber: 1.1,
    sequenceColor: '#fef2cb',
    sequenceLabel: 'Search position and add annotation',
    sequenceDescription:
      'Bei dieser Sequenz wird mit einer Absicht nach einer Stelle im Video gesucht, um dort eine Annotation hinzuzufügen.'
  },
  {
    sequenceNumber: 1.2,
    sequenceColor: '#ffe598',
    sequenceLabel: 'Search position and add annotation and adjust time',
    sequenceDescription:
      'Bei dieser Sequenz wird mit einer Absicht nach einer Stelle im Video gesucht, um dort eine Annotation hinzuzufügen und die Zeitdauer manuell angepasst'
  },
  {
    sequenceNumber: 1.3,
    sequenceColor: '#ffd965',
    sequenceLabel: 'Search position and create annotation',
    sequenceDescription:
      'Bei dieser Sequenz wird mit einer Absicht nach einer Stelle im Video gesucht, um dort eine Annotation hinzuzufügen und ein selbstverfasster Text zu schreiben'
  },
  {
    sequenceNumber: 1.4,
    sequenceColor: '#bf9000',
    sequenceLabel: 'Search position and create annotation and adjust time',
    sequenceDescription:
      'Bei dieser Sequenz wird mit einer Absicht nach einer Stelle im Video gesucht, um dort eine Annotation hinzuzufügen und ein selbstverfasster Text zu schreiben und die Zeitdauer manuell anzupassen'
  },
  {
    sequenceNumber: 2.1,
    sequenceColor: '#deeaf6',
    sequenceLabel: 'Search to adjust annotation time',
    sequenceDescription:
      'Bei dieser Sequenz wird für bestehende Annotationen mit einer Absicht nach passenderen Stellen im Video gesucht und diese dann dementsprechen zeitlich angepasst.'
  },
  {
    sequenceNumber: 2.1,
    sequenceColor: '#deeaf6',
    sequenceLabel: 'Search to adjust annotation time',
    sequenceDescription:
      'Bei dieser Sequenz wird für bestehende Annotationen mit einer Absicht nach passenderen Stellen im Video gesucht und diese dann dementsprechen zeitlich angepasst.'
  },
  {
    sequenceNumber: 2.2,
    sequenceColor: '#bdd6ee',
    sequenceLabel: 'Search to change / complement annotation text',
    sequenceDescription:
      'Bei dieser Sequenz werden zu bestehenden Annotationen weitere Informationen aus bereits gesehenen Videostellen hinzugefügt, indem diese relevanten Stellen jedoch nochmals mit einer Absicht gesucht werden.'
  },
  {
    sequenceNumber: 2.2,
    sequenceColor: '#bdd6ee',
    sequenceLabel: 'Search to change / complement annotation text',
    sequenceDescription:
      'Bei dieser Sequenz werden zu bestehenden Annotationen weitere Informationen aus bereits gesehenen Videostellen hinzugefügt, indem diese relevanten Stellen jedoch nochmals mit einer Absicht gesucht werden.'
  },
  {
    sequenceNumber: 2.3,
    sequenceColor: '#9cc2e5',
    sequenceLabel: 'Search to change / complement annotation and adjust time',
    sequenceDescription:
      'Bei dieser Sequenz wird für bestehende Annotationen mit einer Absicht nach passenderen Stellen im Video gesucht, um diese zu ergänzen und sie zusätzlich noch zeitlich anzupassen.'
  },
  {
    sequenceNumber: 2.3,
    sequenceColor: '#9cc2e5',
    sequenceLabel: 'Search to change / complement annotation and adjust time',
    sequenceDescription:
      'Bei dieser Sequenz wird für bestehende Annotationen mit einer Absicht nach passenderen Stellen im Video gesucht, um diese zu ergänzen und sie zusätzlich noch zeitlich anzupassen.'
  },
  {
    sequenceNumber: 3.1,
    sequenceColor: '#fbe4d5',
    sequenceLabel: 'Find position and add new annotation',
    sequenceDescription:
      'Bei dieser Sequenz wird passiv, d.h. beim Schauen des Videos eine passende Stelle gefunden, und an dieser Stelle wird eine Annotation hinzugefügt.'
  },
  {
    sequenceNumber: 3.2,
    sequenceColor: '#f7caac',
    sequenceLabel: 'Find position and add annotation and adjust time',
    sequenceDescription:
      'Bei dieser Sequenz wird passiv, d.h. beim Schauen des Videos eine passende Stelle gefunden, und an dieser Stelle wird eine Annotation hinzugefügt und diese zeitlich angepasst.'
  },
  {
    sequenceNumber: 3.3,
    sequenceColor: '#f4b083',
    sequenceLabel: 'Find position and create new annotation',
    sequenceDescription:
      'Bei dieser Sequenz wird passiv, d.h. beim Schauen des Videos eine passende Stelle gefunden, und an dieser Stelle wird eine Annotation hinzugefügt und ein selbstverfasster Text geschrieben.'
  },
  {
    sequenceNumber: 3.4,
    sequenceColor: '#c55a11',
    sequenceLabel: 'Find position and create annotation and adjust time',
    sequenceDescription:
      'Bei dieser Sequenz wird passiv, d.h. beim Schauen des Videos eine passende Stelle gefunden, und an dieser Stelle wird eine Annotation hinzugefügt, ein selbstverfasster Text geschrieben und die Zeitdauer manuell angepasst'
  },
  {
    sequenceNumber: 4.1,
    sequenceColor: '#e2efd9',
    sequenceLabel: 'Find position and adjust annotation time',
    sequenceDescription:
      'Bei dieser Sequenz wird die Zeit von bestehende Annotationen verändert, weil beiläufig eine bessere Stelle für diese Annotationen gefunden wird.'
  },
  {
    sequenceNumber: 4.1,
    sequenceColor: '#e2efd9',
    sequenceLabel: 'Find position and adjust annotation time',
    sequenceDescription:
      'Bei dieser Sequenz wird die Zeit von bestehende Annotationen veränder, weil beiläufig eine bessere Stelle für diese Annotationen gefunden wird.'
  },
  {
    sequenceNumber: 4.2,
    sequenceColor: '#c5e0b3',
    sequenceLabel: 'Add further video information to annotation',
    sequenceDescription:
      'Bei dieser Sequenz werden zu bestehenden Annotationen weitere Informationen hinzugefügt.'
  },
  {
    sequenceNumber: 4.2,
    sequenceColor: '#c5e0b3',
    sequenceLabel: 'Add further video information to annotation',
    sequenceDescription:
      'Bei dieser Sequenz werden zu bestehenden Annotationen weitere Informationen hinzugefügt.'
  },
  {
    sequenceNumber: 4.3,
    sequenceColor: '#a8d08d',
    sequenceLabel:
      'Add further video information to annotation and adjust time',
    sequenceDescription:
      'Bei dieser Sequenz werden zu bestehenden Annotationen weitere Informationen hinzugefügt und die Zeit der Annotation verändert'
  },
  {
    sequenceNumber: 4.3,
    sequenceColor: '#a8d08d',
    sequenceLabel:
      'Add further video information to annotation and adjust time',
    sequenceDescription:
      'Bei dieser Sequenz werden zu bestehenden Annotationen weitere Informationen hinzugefügt und die Zeit der Annotation verändert'
  },
  {
    sequenceNumber: 5.1,
    sequenceColor: '#d0cece',
    sequenceLabel: 'Rewatch',
    sequenceDescription:
      'Bei dieser Sequenz wird eine Stelle im Video mit einer Absicht erneut angeschaut.'
  },
  {
    sequenceNumber: 5.2,
    sequenceColor: '#adaaab',
    sequenceLabel: 'Jump forward',
    sequenceDescription:
      'Bei dieser Sequenz wird eine Stelle im Video mit einer Absicht erneut angeschaut.'
  },
  {
    sequenceNumber: 5.3,
    sequenceColor: '#747171',
    sequenceLabel: 'Skipping',
    sequenceDescription:
      'Bei dieser Sequenz wird eine Stelle im Video mit einer Absicht erneut angeschaut.'
  }
];