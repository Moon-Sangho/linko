import { ipcMain } from 'electron';
import { IpcChannels } from '@shared/ipc-channels';
import { isValidId } from '@shared/utils/is-valid-id';
import type { Tag, CreateTagInput, IpcResult } from '@shared/types';
import type { TagRepository } from '../db/repositories/tag-repository';

export function registerTagHandlers(repo: TagRepository): void {
  ipcMain.handle(IpcChannels.TAGS_GET_ALL, (): Tag[] => {
    return repo.getAll();
  });

  ipcMain.handle(IpcChannels.TAG_CREATE, (_, input: CreateTagInput): IpcResult<Tag> => {
    try {
      if (!input.name || !input.name.trim()) {
        return { success: false, error: 'Tag name cannot be empty' };
      }
      return { success: true, data: repo.create(input) };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle(IpcChannels.TAG_DELETE, (_, id: number): IpcResult => {
    try {
      if (!isValidId(id)) return { success: false, error: 'Invalid id' };
      repo.delete(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });
}

