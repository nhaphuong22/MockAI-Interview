import { create } from 'zustand';

/**
 * @typedef {import('../types/cv').CVComponent} CVComponent
 * @typedef {import('../types/cv').CVProject} CVProject
 */

const useCvBuilderStore = create((set) => ({
  // UI State
  selectedComponentId: null,
  isDragging: false,
  
  // Local project draft (to avoid hitting tanstack query cache repeatedly for every keystroke)
  projectDraft: null,

  // Actions
  setSelectedComponentId: (id) => set({ selectedComponentId: id }),
  setIsDragging: (isDragging) => set({ isDragging }),
  
  setProjectDraft: (project) => set({ projectDraft: project }),
  
  updateComponentData: (componentId, newData) => set((state) => {
    if (!state.projectDraft) return state;
    
    const newComponents = state.projectDraft.components.map(comp => 
      comp.id === componentId ? { ...comp, data: { ...comp.data, ...newData } } : comp
    );
    
    return {
      projectDraft: {
        ...state.projectDraft,
        components: newComponents
      }
    };
  }),

  moveComponentToColumn: (activeId, targetColumn, newIndex) => set((state) => {
    if (!state.projectDraft) return state;
    
    const components = [...state.projectDraft.components];
    const itemIndex = components.findIndex(c => c.id === activeId);
    if (itemIndex === -1) return state;

    const item = { ...components[itemIndex], column: targetColumn };
    components.splice(itemIndex, 1);

    // Lấy các item ở column đích
    const targetColumnItems = components.filter(c => c.column === targetColumn);
    
    if (newIndex === undefined || newIndex >= targetColumnItems.length) {
      // Đưa vào cuối column
      components.push(item);
    } else {
      // Tìm vị trí thật trong mảng components tổng
      const targetItem = targetColumnItems[newIndex];
      const realIndex = components.findIndex(c => c.id === targetItem.id);
      components.splice(realIndex, 0, item);
    }

    return {
      projectDraft: {
        ...state.projectDraft,
        components
      }
    };
  }),

  reorderComponents: (activeId, overId) => set((state) => {
    if (!state.projectDraft) return state;
    
    const { components } = state.projectDraft;
    const oldIndex = components.findIndex(c => c.id === activeId);
    const newIndex = components.findIndex(c => c.id === overId);
    
    if (oldIndex === -1 || newIndex === -1) return state;
    
    // Đảm bảo cùng column
    const movedItem = components[oldIndex];
    const targetItem = components[newIndex];

    const newArray = [...components];
    newArray.splice(oldIndex, 1);
    
    // Nếu kéo sang item khác column, thì gán column của overId cho activeId
    const itemToInsert = { ...movedItem, column: targetItem.column };
    
    // Tìm lại index mới do mảng vừa bị splice
    const adjustedNewIndex = newArray.findIndex(c => c.id === overId);
    
    newArray.splice(adjustedNewIndex, 0, itemToInsert);
    
    return {
      projectDraft: {
        ...state.projectDraft,
        components: newArray
      }
    };
  }),
}));

export default useCvBuilderStore;
