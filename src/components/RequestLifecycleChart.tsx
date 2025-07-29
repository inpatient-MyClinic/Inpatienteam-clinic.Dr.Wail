import React from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const nodes: Node[] = [
  // Phase 1: Request Creation
  {
    id: 'nurse',
    type: 'default',
    position: { x: 100, y: 50 },
    data: { 
      label: '👩‍⚕️ Nurse\nCreates Request\nSelects Doctor' 
    },
    style: { 
      backgroundColor: '#E8F5E8',
      border: '2px solid #4CAF50',
      borderRadius: '12px',
      width: 140,
      textAlign: 'center'
    }
  },
  {
    id: 'doctor',
    type: 'default', 
    position: { x: 300, y: 50 },
    data: { 
      label: '👨‍⚕️ Doctor\nDirect Request\nOR Review Nurse' 
    },
    style: {
      backgroundColor: '#E3F2FD',
      border: '2px solid #2196F3', 
      borderRadius: '12px',
      width: 140,
      textAlign: 'center'
    }
  },

  // Phase 2: Case Coordinator
  {
    id: 'coordinator',
    type: 'default',
    position: { x: 200, y: 200 },
    data: { 
      label: '📋 Case Coordinator\nReview & Assign\n4hr Auto-escalation' 
    },
    style: {
      backgroundColor: '#FFF3E0',
      border: '2px solid #FF9800',
      borderRadius: '12px', 
      width: 160,
      textAlign: 'center'
    }
  },

  // Decision Point
  {
    id: 'decision1',
    type: 'default',
    position: { x: 200, y: 320 },
    data: { 
      label: '❓ Complete?\nYes → Hospital\nNo → Return' 
    },
    style: {
      backgroundColor: '#FCE4EC',
      border: '2px solid #E91E63',
      borderRadius: '50%',
      width: 120,
      height: 120,
      textAlign: 'center'
    }
  },

  // Phase 3: Hospital
  {
    id: 'hospital',
    type: 'default',
    position: { x: 200, y: 480 },
    data: { 
      label: '🏥 Hospital\nReview Case\nProcess/Insurance' 
    },
    style: {
      backgroundColor: '#F3E5F5',
      border: '2px solid #9C27B0',
      borderRadius: '12px',
      width: 160,
      textAlign: 'center'
    }
  },

  // Decision Point 2
  {
    id: 'decision2', 
    type: 'default',
    position: { x: 200, y: 600 },
    data: { 
      label: '❓ Approved?\nYes → Done\nNo → Justify' 
    },
    style: {
      backgroundColor: '#FCE4EC',
      border: '2px solid #E91E63', 
      borderRadius: '50%',
      width: 120,
      height: 120,
      textAlign: 'center'
    }
  },

  // Phase 4: Customer Care
  {
    id: 'customercare',
    type: 'default',
    position: { x: 50, y: 760 },
    data: { 
      label: '📞 Customer Care\n2-day Survey\nComplaint Handling' 
    },
    style: {
      backgroundColor: '#E8F5E8',
      border: '2px solid #4CAF50',
      borderRadius: '12px',
      width: 150,
      textAlign: 'center'
    }
  },

  // Phase 5: Finance
  {
    id: 'finance',
    type: 'default',
    position: { x: 350, y: 760 },
    data: { 
      label: '💰 Finance\nPayment Tracking\nDoctor Payment' 
    },
    style: {
      backgroundColor: '#FFF8E1',
      border: '2px solid #FFC107',
      borderRadius: '12px', 
      width: 150,
      textAlign: 'center'
    }
  },

  // Status Indicators
  {
    id: 'pending',
    type: 'default',
    position: { x: 500, y: 50 },
    data: { label: '⏳ Pending' },
    style: { 
      backgroundColor: '#FFEBEE',
      border: '1px solid #F44336',
      borderRadius: '20px',
      fontSize: '12px'
    }
  },
  {
    id: 'assigned',
    type: 'default',
    position: { x: 500, y: 200 },
    data: { label: '📌 Assigned' },
    style: { 
      backgroundColor: '#FFF3E0',
      border: '1px solid #FF9800',
      borderRadius: '20px',
      fontSize: '12px'
    }
  },
  {
    id: 'inprogress',
    type: 'default', 
    position: { x: 500, y: 480 },
    data: { label: '⚡ In Progress' },
    style: { 
      backgroundColor: '#E3F2FD',
      border: '1px solid #2196F3',
      borderRadius: '20px',
      fontSize: '12px'
    }
  },
  {
    id: 'done',
    type: 'default',
    position: { x: 500, y: 760 },
    data: { label: '✅ Done' },
    style: { 
      backgroundColor: '#E8F5E8',
      border: '1px solid #4CAF50',
      borderRadius: '20px',
      fontSize: '12px'
    }
  },

  // Auto-escalation
  {
    id: 'autoescalation',
    type: 'default',
    position: { x: 50, y: 320 },
    data: { 
      label: '⏰ 4 Hour\nAuto-escalation\nto Hospital' 
    },
    style: {
      backgroundColor: '#FFEBEE',
      border: '2px dashed #F44336',
      borderRadius: '12px',
      width: 120,
      textAlign: 'center'
    }
  }
];

const edges: Edge[] = [
  // Main flow
  { id: 'e1', source: 'nurse', target: 'coordinator', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e2', source: 'doctor', target: 'coordinator', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e3', source: 'coordinator', target: 'decision1', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e4', source: 'decision1', target: 'hospital', label: 'Complete', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e5', source: 'hospital', target: 'decision2', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e6', source: 'decision2', target: 'customercare', label: 'Done', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e7', source: 'decision2', target: 'finance', label: 'Done', markerEnd: { type: MarkerType.ArrowClosed } },

  // Return flows
  { 
    id: 'e8', 
    source: 'decision1', 
    target: 'nurse', 
    label: 'Incomplete',
    style: { stroke: '#F44336', strokeDasharray: '5,5' },
    markerEnd: { type: MarkerType.ArrowClosed }
  },
  { 
    id: 'e9', 
    source: 'decision2', 
    target: 'coordinator', 
    label: 'Need Justification',
    style: { stroke: '#F44336', strokeDasharray: '5,5' },
    markerEnd: { type: MarkerType.ArrowClosed }
  },

  // Auto-escalation
  { 
    id: 'e10', 
    source: 'autoescalation', 
    target: 'hospital',
    style: { stroke: '#F44336', strokeDasharray: '10,5' },
    markerEnd: { type: MarkerType.ArrowClosed }
  },

  // Status connections
  { id: 'e11', source: 'nurse', target: 'pending', style: { stroke: '#999', strokeWidth: 1 } },
  { id: 'e12', source: 'coordinator', target: 'assigned', style: { stroke: '#999', strokeWidth: 1 } },
  { id: 'e13', source: 'hospital', target: 'inprogress', style: { stroke: '#999', strokeWidth: 1 } },
  { id: 'e14', source: 'customercare', target: 'done', style: { stroke: '#999', strokeWidth: 1 } },
  { id: 'e15', source: 'finance', target: 'done', style: { stroke: '#999', strokeWidth: 1 } }
];

const RequestLifecycleChart = () => {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          🔄 Medical Request Lifecycle & Data Flow
        </h2>
        <div className="bg-white rounded-lg shadow-lg p-2 mb-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-200 border border-green-500 rounded"></div>
              <span>Creation Phase</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-200 border border-orange-500 rounded"></div>
              <span>Processing Phase</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-200 border border-purple-500 rounded"></div>
              <span>Hospital Phase</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-200 border border-yellow-500 rounded"></div>
              <span>Finance Phase</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-red-500 border-dashed"></div>
              <span>Return/Escalation Flow</span>
            </div>
          </div>
        </div>
      </div>
      
      <div style={{ height: 'calc(100vh - 120px)' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          attributionPosition="bottom-left"
          style={{ backgroundColor: 'transparent' }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={true}
        >
          <Background />
          <Controls />
          <MiniMap 
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0'
            }}
            nodeColor={(node) => {
              if (node.style?.backgroundColor) {
                return node.style.backgroundColor as string;
              }
              return '#94a3b8';
            }}
          />
        </ReactFlow>
      </div>
    </div>
  );
};

export default RequestLifecycleChart;