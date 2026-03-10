import { globalToolRegistry } from "../../../shared/cli/registry.js"
import { extractClassInfoTool, handleExtractClassInfo } from "./extractClassInfo.js"
import { findFilesTool, handleFindFiles } from "./findFiles.js"
import { generateManifestTool, handleGenerateManifest } from "./generateManifest.js"
import { compareManifestsTool, handleCompareManifests } from "./compareManifests.js"
import { compareWithRepositoryTool, handleCompareWithRepository } from "./compareWithRepository.js"
import { createBackupTool, handleCreateBackup } from "./createBackup.js"
import { classifyFilesTool, handleClassifyFiles } from "./classifyFiles.js"
import { getPromptContentTool, handleGetPromptContent } from "./getPromptContent.js"
import { getTemplateContentTool, handleGetTemplateContent } from "./getTemplateContent.js"

export function registerTools() {
    globalToolRegistry.registerTool({
        ...extractClassInfoTool,
        handler: handleExtractClassInfo
    })

    globalToolRegistry.registerTool({
        ...findFilesTool,
        handler: handleFindFiles
    })

    globalToolRegistry.registerTool({
        ...generateManifestTool,
        handler: handleGenerateManifest
    })

    globalToolRegistry.registerTool({
        ...compareManifestsTool,
        handler: handleCompareManifests
    })

    globalToolRegistry.registerTool({
        ...compareWithRepositoryTool,
        handler: handleCompareWithRepository
    })

    globalToolRegistry.registerTool({
        ...createBackupTool,
        handler: handleCreateBackup
    })

    globalToolRegistry.registerTool({
        ...classifyFilesTool,
        handler: handleClassifyFiles
    })

    globalToolRegistry.registerTool({
        ...getPromptContentTool,
        handler: handleGetPromptContent
    })

    globalToolRegistry.registerTool({
        ...getTemplateContentTool,
        handler: handleGetTemplateContent
    })
}
