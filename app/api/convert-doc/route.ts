import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { writeFile, unlink } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    const fileName = file.name.toLowerCase()
    if (!fileName.endsWith('.doc')) {
      return NextResponse.json(
        { error: 'Only .doc files are supported for conversion' },
        { status: 400 }
      )
    }

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    const tempDir = tmpdir()
    const inputPath = join(tempDir, `doc-${Date.now()}-${Math.random().toString(36).substring(7)}.doc`)
    const outputPath = join(tempDir, `doc-${Date.now()}-${Math.random().toString(36).substring(7)}.docx`)

    try {
      // Write the input .doc file
      await writeFile(inputPath, buffer)
      console.log(`Wrote input file to: ${inputPath}`)

      // Convert .doc to .docx using LibreOffice
      // This command uses LibreOffice in headless mode to convert the document
      const command = `soffice --headless --convert-to docx --outdir "${tempDir}" "${inputPath}"`
      
      console.log(`Executing conversion command: ${command}`)
      await execAsync(command, { timeout: 30000 })

      // The output file will have the same name as input but with .docx extension
      const outputFileFromLibreOffice = join(tempDir, inputPath.split(/[\\/]/).pop()!.replace('.doc', '.docx'))
      
      // Read the converted file
      const fs = require('fs')
      const convertedBuffer = fs.readFileSync(outputFileFromLibreOffice)

      // Clean up temporary files
      await Promise.all([
        unlink(inputPath).catch(() => {}),
        unlink(outputFileFromLibreOffice).catch(() => {})
      ])

      // Return the converted file as a buffer
      const response = new NextResponse(convertedBuffer)
      response.headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
      response.headers.set('Content-Disposition', `attachment; filename="${fileName.replace('.doc', '.docx')}"`)
      
      return response
    } catch (conversionError: any) {
      // Clean up on error
      await Promise.all([
        unlink(inputPath).catch(() => {}),
        unlink(outputPath).catch(() => {})
      ])

      console.error('LibreOffice conversion failed:', conversionError.message)
      
      return NextResponse.json(
        { error: 'Failed to convert .doc file. LibreOffice may not be installed or the file is corrupted.' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'An error occurred during conversion' },
      { status: 500 }
    )
  }
}
