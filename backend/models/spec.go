package model

type Top struct {
	RequestID       uint `gorm:"primaryKey"`
	Chest           string
	ShoulderToWaist string
	Shoulder        string
	SleveLength     string
	Waist           string
	Neck            string
	Collar          bool
}

type Bottom struct {
	RequestID    uint `gorm:"primaryKey"`
	WaistToAnkle string
	Waist        string
	Hip          string
	Ankle        string
	Thigh        string
	Knee         string
	CuffWidth    string
}

type Dress struct {
	RequestID   uint `gorm:"primaryKey"`
	Chest       string
	Shoulder    string
	DressLength string
	Waist       string
	Hip         string
}

type Suit struct {
	RequestID    uint `gorm:"primaryKey"`
	Chest        string
	Waist        string
	Hip          string
	Shoulder     string
	SleeveLength string
	JacketLength string
	Inseam       string
	Outseam      string
	Thigh        string
	Knee         string
	Ankle        string
}

type ToteBag struct {
	RequestID uint `gorm:"primaryKey"`
	Color     string
	Material  string
	Writing   string
	ImageDesc string
}
