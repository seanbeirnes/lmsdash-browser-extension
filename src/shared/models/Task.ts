export const TaskTypes = {
    coursesScan: "courses-scan",
  } as const

export const TaskStatuses = {
    NOT_STARTED: "not-started",
    RUNNING: "running",
    PAUSED: "paused",
    COMPLETE: "complete",
    FAILED: "failed",
  } as const

export type TaskType = typeof TaskTypes[keyof typeof TaskTypes]
export type TaskStatus = typeof TaskStatuses[keyof typeof TaskStatuses]

export default class Task {
  id: number
  uuid: string
  type: string
  status: TaskStatus
  timeCreated: number
  timeStarted: number | null
  timeUpdated: number
  timeFinished: number | null
  progress: number
  progressData: unknown
  errorsData: unknown
  settingsData: unknown
  resultsData: unknown
  controller: unknown | null

  constructor(type: string, settingsData: unknown = null) {
    this.id = -1
    this.uuid = crypto.randomUUID()
    this.type = type
    this.status = TaskStatuses.NOT_STARTED
    this.timeCreated = Date.now()
    this.timeStarted = null
    this.timeUpdated = Date.now()
    this.timeFinished = null
    this.progress = 0
    this.progressData = null
    this.errorsData = null
    this.settingsData = settingsData
    this.resultsData = null
    this.controller = null
  }

  private updateTime(): void {
    this.timeUpdated = Date.now()
  }

  getId(): number {
    return this.id
  }

  setId(id: number): void {
    this.id = id
  }

  getUuid(): string {
    return this.uuid
  }

  getStatus(): TaskStatus {
    return this.status
  }

  setStatus(status: TaskStatus): void {
    this.status = status
    this.updateTime()
  }

  getTimes(): { created: number; started: number | null; updated: number; finished: number | null } {
    return { created: this.timeCreated, started: this.timeStarted, updated: this.timeUpdated, finished: this.timeFinished }
  }

  setTimeStarted(): void {
    this.timeStarted = Date.now()
    this.updateTime()
  }

  setTimeFinished(): void {
    this.timeFinished = Date.now()
    this.updateTime()
  }

  getProgress(): number {
    return this.progress
  }

  setProgress(progress: number): void {
    this.progress = progress
    this.updateTime()
  }

  getProgressData(): unknown {
    return this.progressData
  }

  setProgressData(data: unknown): void {
    this.progressData = data
    this.updateTime()
  }

  getErrorsData(): unknown {
    return this.errorsData
  }

  setErrorsData(data: unknown): void {
    this.errorsData = data
    this.updateTime()
  }

  getSettingsData(): unknown {
    return this.settingsData
  }

  getResultsData(): unknown {
    return this.resultsData
  }

  setResultsData(data: unknown): void {
    this.resultsData = data
    this.updateTime()
  }

  toString(): string {
    return (
      `ID: ${this.id}\n` +
      `UUID: ${this.uuid}\n` +
      `Type: ${this.type}\n` +
      `Status: ${this.status}\n` +
      `Time Created: ${new Date(this.timeCreated).toISOString()}\n` +
      `Time Started: ${this.timeStarted ? new Date(this.timeStarted).toISOString() : "Not started"}\n` +
      `Time Updated: ${new Date(this.timeUpdated).toISOString()}\n` +
      `Time Finished: ${this.timeFinished ? new Date(this.timeFinished).toISOString() : "Not finished"}\n` +
      `Progress: ${this.progress}\n` +
      `Progress Data: ${JSON.stringify(this.progressData)}\n` +
      `Errors Data: ${JSON.stringify(this.errorsData)}\n` +
      `Settings Data: ${JSON.stringify(this.settingsData)}\n` +
      `Results Data: ${JSON.stringify(this.resultsData)}`
    )
  }
}