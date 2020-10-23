var genericSequenceColumnData = [
  {
    field: 'sequenceNumber',
    title: 'Sequence',
    sortable: true,
    searchable: true,
    cellStyle: getCellColorBySequenceNumber,
    footerFormatter: function(items) {
      return 'TOTAL';
    }
  },
  {
    field: 'sequenceLabel',
    title: 'Description',
    sortable: false,
    searchable: false,
    footerFormatter: function(items) {
      return '';
    }
  },
  {
    field: 'count',
    title: 'Amount',
    sortable: true,
    searchable: false,
    footerFormatter: function(items) {
      var totalCount = 0;
      items.forEach(function(item) {
        totalCount = totalCount + item.count;
      });
      return totalCount;
    }
  },
  {
    field: 'percentage',
    title: 'Percentage',
    sortable: true,
    searchable: false,
    cellStyle: getCellColorPercent,
    footerFormatter: function(items) {
      var totalCount = 0;
      items.forEach(function(item) {
        totalCount = totalCount + item.percentage;
      });
      return Math.round(totalCount);
    }
  }
];

var genericActionColumnData = [
  {
    field: 'actionsUsed',
    title: 'Used Actions',
    sortable: true,
    searchable: false
  },
  {
    field: 'actionsNotUsed',
    title: 'Actions not used',
    sortable: true,
    searchable: false
  },
  {
    field: 'actionsTotal',
    title: 'TOTAL Actions',
    sortable: true,
    searchable: false
  },
  {
    field: 'actionsUsedPercent',
    title: 'Percentage Used Actions',
    sortable: true,
    searchable: false
  }
];

var genericActionTypeColumnData = [
  {
    field: 'actionName',
    title: 'Action',
    sortable: true,
    searchable: true,
    footerFormatter: function(items) {
      return 'TOTAL';
    }
  },
  {
    field: 'countTotal',
    title: 'Total amount',
    sortable: true,
    searchable: false,
    footerFormatter: function(items) {
      var totalCount = 0;
      items.forEach(function(item) {
        totalCount = totalCount + item.countTotal;
      });
      return totalCount;
    }
  },
  {
    field: 'countUsed',
    title: 'Amount used',
    sortable: true,
    searchable: false,
    footerFormatter: function(items) {
      var totalCount = 0;
      items.forEach(function(item) {
        totalCount = totalCount + item.countUsed;
      });
      return totalCount;
    }
  },
  {
    field: 'percentageUsed',
    title: 'Percentage used',
    sortable: true,
    searchable: false,
    cellStyle: getCellColorPercent,
    footerFormatter: function(items) {
      var totalCount = 0;
      items.forEach(function(item) {
        totalCount = totalCount + item.percentageUsed;
      });
      return Math.round(totalCount*1000)/1000;
    }
  },
  {
    field: 'percentageTotal',
    title: 'Percentage total',
    sortable: true,
    searchable: false,
    cellStyle: getCellColorPercent,
    footerFormatter: function(items) {
      var totalCount = 0;
      items.forEach(function(item) {
        totalCount = totalCount + item.percentageTotal;
      });
      return Math.round(totalCount*1000)/1000;
    }
  }
];

var coloredMarkovSequenceColumnData = [
  {
    field: 'sequenceNumber',
    title: '',
    sortable: false,
    searchable: false,
    class: 'font-weight-bold'
  },
  {
    field: '1.1_rel',
    title: '1.1',
    sortable: false,
    searchable: false,
    cellStyle: getCellColor
  },
  {
    field: '1.2_rel',
    title: '1.2',
    sortable: false,
    searchable: false,
    cellStyle: getCellColor
  },
  {
    field: '1.3_rel',
    title: '1.3',
    sortable: false,
    searchable: false,
    cellStyle: getCellColor
  },
  {
    field: '1.4_rel',
    title: '1.4',
    sortable: false,
    searchable: false,
    cellStyle: getCellColor
  },
  {
    field: '2.1_rel',
    title: '2.1',
    sortable: false,
    searchable: false,
    cellStyle: getCellColor
  },
  {
    field: '2.2_rel',
    title: '2.2',
    sortable: false,
    searchable: false,
    cellStyle: getCellColor
  },
  {
    field: '2.3_rel',
    title: '2.3',
    sortable: false,
    searchable: false,
    cellStyle: getCellColor
  },
  {
    field: '3.1_rel',
    title: '3.1',
    sortable: false,
    searchable: false,
    cellStyle: getCellColor
  },
  {
    field: '3.2_rel',
    title: '3.2',
    sortable: false,
    searchable: false,
    cellStyle: getCellColor
  },
  {
    field: '3.3_rel',
    title: '3.3',
    sortable: false,
    searchable: false,
    cellStyle: getCellColor
  },
  {
    field: '3.4_rel',
    title: '3.4',
    sortable: false,
    searchable: false,
    cellStyle: getCellColor
  },
  {
    field: '4.1_rel',
    title: '4.1',
    sortable: false,
    searchable: false,
    cellStyle: getCellColor
  },
  {
    field: '4.2_rel',
    title: '4.2',
    sortable: false,
    searchable: false,
    cellStyle: getCellColor
  },
  {
    field: '4.3_rel',
    title: '4.3',
    sortable: false,
    searchable: false,
    cellStyle: getCellColor
  },
  {
    field: '5.1_rel',
    title: '5.1',
    sortable: false,
    searchable: false,
    cellStyle: getCellColor
  },
  {
    field: '5.2_rel',
    title: '5.2',
    sortable: false,
    searchable: false,
    cellStyle: getCellColor
  },
  {
    field: '5.3_rel',
    title: '5.3',
    sortable: false,
    searchable: false,
    cellStyle: getCellColor
  },
  {
    field: 'totalRowCountRelative',
    title: 'TOTAL',
    sortable: false,
    searchable: false,
    class: 'font-weight-bold'
  },
];

var coloredMarkovMainSequenceColumnData = [
  {
    field: 'sequenceNumber',
    title: '',
    sortable: false,
    searchable: false,
    class: 'font-weight-bold'
  },
  {
    field: '1_rel',
    title: '1',
    sortable: false,
    searchable: false,
    cellStyle: getCellColor
  },
  {
    field: '2_rel',
    title: '2',
    sortable: false,
    searchable: false,
    cellStyle: getCellColor
  },
  {
    field: '3_rel',
    title: '3',
    sortable: false,
    searchable: false,
    cellStyle: getCellColor
  },
  {
    field: '4_rel',
    title: '4',
    sortable: false,
    searchable: false,
    cellStyle: getCellColor
  },
  {
    field: '5_rel',
    title: '5',
    sortable: false,
    searchable: false,
    cellStyle: getCellColor
  },
  {
    field: 'totalRowCountRelative',
    title: 'TOTAL',
    sortable: false,
    searchable: false,
    class: 'font-weight-bold'
  }
];

var coloredMarkovActionColumnData = [
  {
    field: 'actionName',
    title: '',
    sortable: false,
    searchable: false,
    class: 'font-weight-bold'
  },
  {
    field: 'VideoPlay_rel',
    title: 'VideoPlay',
    sortable: false,
    searchable: false,
    cellStyle: getCellColor
  },
  {
    field: 'VideoPause_rel',
    title: 'VideoPause',
    sortable: false,
    searchable: false,
    cellStyle: getCellColor
  },
  {
    field: 'VideoJumpBackward_rel',
    title: 'VideoJumpBackward',
    sortable: false,
    searchable: false,
    cellStyle: getCellColor
  },
  {
    field: 'VideoJumpForward_rel',
    title: 'VideoJumpForward',
    sortable: false,
    searchable: false,
    cellStyle: getCellColor
  },
  {
    field: 'AnnotationAdd_rel',
    title: 'AnnotationAdd',
    sortable: false,
    searchable: false,
    cellStyle: getCellColor
  },
  {
    field: 'AnnotationChangeText_rel',
    title: 'AnnotationChangeText',
    sortable: false,
    searchable: false,
    cellStyle: getCellColor
  },
  {
    field: 'AnnotationChangeTime_rel',
    title: 'AnnotationChangeTime',
    sortable: false,
    searchable: false,
    cellStyle: getCellColor
  },
  {
    field: 'totalRowCountRelative',
    title: 'TOTAL',
    sortable: false,
    searchable: false,
    class: 'font-weight-bold'
  }
];